from PIL import Image, ImageDraw, ImageFont
import io

def apply_bharat_mark(image_path):
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)
    
    width, height = img.size
    watermark_text = "भारत MARK - AI VERIFIED"
    
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), watermark_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = width - text_width - 20
    y = height - text_height - 20
    
    draw.rectangle([x-10, y-10, x+text_width+10, y+text_height+10], fill=(255, 255, 255, 200))
    draw.text((x, y), watermark_text, fill=(255, 0, 0), font=font)
    
    output = io.BytesIO()
    img.save(output, format='PNG')
    output.seek(0)
    
    return output