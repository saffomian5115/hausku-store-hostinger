import urllib.request
import re

req = urllib.request.Request(
    "https://www.pexels.com/search/wood%20texture/",
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
)
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8")
        pattern = r"https://images\.pexels\.com/photos/\d+/[^\"\'\?\s]+\.jpeg"
        matches = re.findall(pattern, html)
        seen = set()
        unique_matches = []
        for m in matches:
            if m not in seen:
                seen.add(m)
                unique_matches.append(m)
        for i, url in enumerate(unique_matches[:5]):
            print(f"{i+1}: {url}")
except Exception as e:
    print("Error:", e)
