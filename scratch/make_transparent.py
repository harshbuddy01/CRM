from PIL import Image

def make_transparent():
    try:
        # Load the original JPG logo
        img = Image.open('public/logo.jpg')
        img = img.convert("RGBA")
        
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # item is (R, G, B, A)
            # If the pixel is very close to white, make it transparent
            r, g, b, a = item
            if r > 230 and g > 230 and b > 230:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save("public/logo.png", "PNG")
        print("Successfully processed logo to public/logo.png")
    except Exception as e:
        print(f"Error processing logo: {e}")

if __name__ == '__main__':
    make_transparent()
