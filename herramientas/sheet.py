# Hoja de contactos con etiqueta: python3 sheet.py <salida.png> <columnas> <escala> img1.png img2.png ...
import sys, os
from PIL import Image, ImageDraw, ImageFont

out, cols, scale, files = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = int(ims[0].width * scale), int(ims[0].height * scale)
LBL = 22
try:
    font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 15)
except OSError:
    font = ImageFont.load_default()
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + LBL)), (12, 12, 12))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + LBL)
    sheet.paste(im.resize((w, h)), (x, y + LBL))
    d.text((x + 4, y + 3), os.path.splitext(os.path.basename(f))[0], fill=(255, 255, 255), font=font)
sheet.save(out)
print(out, sheet.size)
