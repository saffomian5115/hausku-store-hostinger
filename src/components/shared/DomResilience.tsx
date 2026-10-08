"use client";

/**
 * Makes client-side route changes survive third-party DOM mutations.
 *
 * Browser translation (Chrome's "always translate German → English"), extensions
 * and password managers rewrite nodes inside the tree React owns — they move,
 * wrap or detach them. React keeps a pointer to the node it rendered, so on the
 * next client-side navigation its deletion phase calls
 * `parentNode.removeChild(node)` on a node that is no longer where React left it
 * and the whole commit throws:
 *
 *   NotFoundError: Failed to execute 'removeChild' on 'Node':
 *   The node to be removed is not a child of this node.
 *
 * The page then breaks instead of navigating (the dev overlay shows the raw
 * `Runtime NotFoundError`). React has treated this as "third parties must not
 * mutate our DOM" since 2017 (facebook/react#11538), so the accepted mitigation
 * is to make those two DOM operations tolerant of it:
 *
 *   - `removeChild` — remove the node from wherever it currently lives; if it is
 *     already detached there is simply nothing left to remove.
 *   - `insertBefore` — if the anchor node was moved away, append instead of
 *     throwing the same NotFoundError.
 *
 * Only ever triggers when React would otherwise crash, so normal DOM behaviour
 * is unchanged. Renders nothing.
 */

type PatchedWindow = Window & { __domResilienceInstalled__?: boolean };

function installDomResilience() {
  if (typeof window === "undefined") return;

  const patched = window as PatchedWindow;
  if (patched.__domResilienceInstalled__) return;
  patched.__domResilienceInstalled__ = true;

  const nativeRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(
    this: Node,
    child: T
  ): T {
    if (child.parentNode !== this) {
      // A third party moved or detached the node React wants to remove.
      if (child.parentNode) return nativeRemoveChild.call(child.parentNode, child) as T;
      return child;
    }
    return nativeRemoveChild.call(this, child) as T;
  };

  const nativeInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    node: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      // The reference node was moved away — inserting next to it is impossible,
      // so append to the parent instead of throwing.
      return nativeInsertBefore.call(this, node, null) as T;
    }
    return nativeInsertBefore.call(this, node, referenceNode) as T;
  };
}

// Run as soon as this client module is evaluated (before first paint of the app).
installDomResilience();

export default function DomResilience() {
  return null;
}
