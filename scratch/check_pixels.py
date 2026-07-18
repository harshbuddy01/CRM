from PIL import Image

img = Image.open('public/logo.png')
print("Image size:", img.size)
print("Image mode:", img.mode)

# Let's count how many pixels are transparent
datas = img.getdata()
transparent_count = 0
opaque_count = 0

for item in datas:
    if len(item) == 4 and item[3] == 0:
        transparent_count += 1
    else:
        opaque_count += 1

print("Transparent pixels:", transparent_count)
print("Opaque pixels:", opaque_count)
