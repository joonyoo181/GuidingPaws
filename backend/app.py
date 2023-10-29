from flask import Flask, request

app = Flask(__name__)


@app.route("/image", methods=['POST'])
def image():
    if(request.method == "POST"):
        bytesOfImage = request.get_data()
        with open('image.jpg', 'wb') as out:
            out.write(bytesOfImage)
            print(bytesOfImage)
        return "Image read"
    
@app.route("/ping", methods=['GET'])
def ping():
    return "pong"

if __name__ == '__main__':
    app.run(debug=True)