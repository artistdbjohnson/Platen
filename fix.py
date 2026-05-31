import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the anim-controls div block and keep only btn-set-seed
content = re.sub(
    r'<div class=\"anim-controls\" id=\"anim-controls\".*?</button>\s*</div>',
    '',
    content,
    flags=re.DOTALL
)

# 2. Remove the LarkspurKeyAnim definition
content = re.sub(
    r'// -- Larkspur Key Animation Engine \(AE Hyperspeed\) -----------------------------\s*var LarkspurKeyAnim = \(function\(\) \{.*?\n        \}\)\(\);\s*',
    '',
    content,
    flags=re.DOTALL
)

# 3. Simplify isAnimatingAny
content = re.sub(
    r'function isAnimatingAny\(\) \{.*?return keyOn \|\| webglOn;\s*\}',
    'function isAnimatingAny() {\n            return typeof LarkspurAnimate !== \'undefined\' && LarkspurAnimate.isAnimating && LarkspurAnimate.isAnimating();\n        }',
    content,
    flags=re.DOTALL
)

# 4. Simplify stopAnimatingAny
content = re.sub(
    r'function stopAnimatingAny\(\) \{.*?LarkspurAnimate\.stop\(\);\n            \}\n        \}',
    'function stopAnimatingAny() {\n            if (typeof LarkspurAnimate !== \'undefined\' && LarkspurAnimate.isAnimating && LarkspurAnimate.isAnimating()) {\n                LarkspurAnimate.stop();\n            }\n        }',
    content,
    flags=re.DOTALL
)

# 5. Simplify toggleKeyAnim to just toggle LarkspurAnimate
content = re.sub(
    r'function toggleKeyAnim\(\) \{.*?\}\n        \}',
    'function toggleKeyAnim() {\n            if (typeof LarkspurAnimate !== \'undefined\') {\n                var isOn = LarkspurAnimate.toggle();\n                var btn = document.getElementById(\'btn-key-anim\');\n                if (btn) btn.classList.toggle(\'active\', isOn);\n            }\n        }',
    content,
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done applying fixes to index.html')
