from PIL import Image

img = Image.open('public/logo.jpg')
print("Corner (0,0) color:", img.getpixel((0,0)))
print("Corner (10,10) color:", img.getpixel((10,10)))
print("Corner (100,100) color:", img.getpixel((100,100)))
