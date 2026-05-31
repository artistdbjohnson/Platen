import re
with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove anim-controls CSS
code = re.sub(r'        \.anim-controls \{.*?\n        \}\n', '', code, flags=re.DOTALL)
code = re.sub(r'        \.anim-controls label \{.*?\n        \}\n', '', code, flags=re.DOTALL)
code = re.sub(r'        \.anim-controls \.anim-val \{.*?\n        \}\n', '', code, flags=re.DOTALL)
code = re.sub(r'        \.anim-controls \.anim-control-group \{.*?\n        \}\n', '', code, flags=re.DOTALL)
code = re.sub(r'        \.anim-slider \{.*?\n        \}\n', '', code, flags=re.DOTALL)

# Remove anim-controls HTML block
code = re.sub(r'<div class="anim-controls" id="anim-controls" style="display: none;">.*?</div>\n        </div>', '</div>', code, flags=re.DOTALL)

# Remove script tag
code = re.sub(r'\s*<script src="js/larkspur-animate\.js"></script>\s*', '\n\n', code)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)

print('Cleaned index.html')
