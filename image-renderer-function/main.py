from io import BytesIO
import re

import functions_framework
from PIL import Image, ImageDraw, ImageFont

def text_to_image(text):
    dim = 500

    img = Image.new('L', (500, 500), color='white')
    draw = ImageDraw.Draw(img)

    font_size = 100
    while True:
        font = ImageFont.truetype("cour.ttf", font_size)
        bbox = draw.multiline_textbbox((250, 250), text, font, anchor="mm", align="center", spacing=font_size)
        
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]

        target = dim - font_size

        if (w <= target) and (h <= target):
          break

        max_dim = max(w, h)
        scale = target / max_dim + .05
        font_size = int(font_size * scale) - 1

    draw.multiline_text((250, 250), text, font=font, anchor="mm", align="center", spacing=font_size)

    return img

@functions_framework.http
def image_renderer_http(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`
        <https://flask.palletsprojects.com/en/1.1.x/api/#flask.make_response>.
    """
    text = request.args.get('text')
    if text is None:
        return ('', 400)

    # Sanitize
    text = re.sub(r'[^0-9a-zA-Z\s\']', '', text)

    # Log
    print(text.replace("\n", " \\n "))

    img = text_to_image(text)
    img_io = BytesIO()
    img.save(img_io, 'JPEG', quality=100)
    img_io.seek(0)


    headers = {
        'Access-Control-Allow-Origin': '*',
        'cache-control': 'public, max-age=7200',
        'content-type': 'image/jpeg',
    }

    return (img_io, 200, headers)

   
