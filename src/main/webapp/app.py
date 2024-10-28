from flask import Flask, request, send_file
from rembg import remove
from PIL import Image
import io

app = Flask(__name__)

@app.route('/remove-background', methods=['POST'])
def remove_background():
    # Check if the request contains an image file
    if 'image' not in request.files:
        return {"error": "No image file found"}, 400
    
    file = request.files['image']
    
    # Open the uploaded image
    input_image = Image.open(file.stream)

    # Remove the background from the image
    output_image = remove(input_image)
    
    # Prepare the output bytes
    output_bytes = io.BytesIO()
    
    # If the input image is JPG and there is no transparency, save as JPG
    if input_image.mode in ('RGB', 'L') and not has_transparency(output_image):
        output_image.save(output_bytes, format='JPEG')
        mimetype = 'image/jpeg'
    else:
        # Otherwise, save as PNG (for transparency)
        output_image.save(output_bytes, format='PNG')
        mimetype = 'image/png'
    
    output_bytes.seek(0)

    return send_file(output_bytes, mimetype=mimetype)

def has_transparency(image):
    """Check if the image has transparency (alpha channel)"""
    if image.mode == "RGBA":
        return any(pixel[3] < 255 for pixel in image.getdata())
    return False

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
