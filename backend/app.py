import os
from flask import Flask, request
import cv2
import jsonify

app = Flask(__name__)

@app.route("/image", methods=['POST'])
def image():
    if(request.method == "POST"):
        #get image from post request body
        bytesOfImage = request.get_data()
        with open('image.jpg', 'wb') as out:
            out.write(bytesOfImage)
            print(bytesOfImage)
        
        #ml algorithm
        image = cv2.imread('image.jpg')
        h = image.shape[0]
        w = image.shape[1]

        # path to the weights and model files
        weights = "ssd_mobilenet/frozen_inference_graph.pb"
        model = "ssd_mobilenet/ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt"
        # load the MobileNet SSD model trained  on the COCO dataset
        net = cv2.dnn.readNetFromTensorflow(weights, model)

        # load the class labels the model was trained on
        class_names = []
        with open("ssd_mobilenet/coco_names.txt", "r") as f:
            class_names = f.read().strip().split("\n")
        
        # create a blob from the image
        blob = cv2.dnn.blobFromImage(
            image, 1.0/127.5, (320, 320), [127.5, 127.5, 127.5])
        # pass the blog through our network and get the output predictions
        net.setInput(blob)
        output = net.forward()  # shape: (1, 1, 100, 7)

        warn = []

        # loop over the number of detected objects
        for detection in output[0, 0, :, :]:  # output[0, 0, :, :] has a shape of: (100, 7)
            # the confidence of the model regarding the detected object
            probability = detection[2]

            # if the confidence of the model is lower than 50%,
            # we do nothing (continue looping)
            if probability < 0.5:
                continue

            # perform element-wise multiplication to get
            # the (x, y) coordinates of the bounding box
            box = [int(a * b) for a, b in zip(detection[3:7], [w, h, w, h])]
            box = tuple(box)
            # draw the bounding box of the object
            cv2.rectangle(image, box[:2], box[2:], (0, 255, 0), thickness=2)

            # extract the ID of the detected object to get its name
            class_id = int(detection[1])
            # draw the name of the predicted object along with the probability
            label = f"{class_names[class_id - 1].upper()} {probability * 100:.2f}%"
            cv2.putText(image, label, (box[0], box[1] + 15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            rec_width = abs(box[0] - box[2])
            rec_height = abs(box[1] - box[3])
            rec_area = rec_width * rec_height
            print(rec_area)
            print(w*h)

            if rec_area >= w*h*0.3:
                rec_mid = (box[0] + box[2])/2
                pic_mid = w / 2
                pic_lower = 0.9 * pic_mid
                pic_upper = 1.1 * pic_mid

                direction = ""
                if rec_mid < pic_lower: 
                    direction = "left"
                elif rec_mid < pic_upper: 
                    direction = "middle"
                else:
                    direction = "right"
                warn.append([label, direction])

        print(warn)

        #warn is the array of all the stuff processed from the ml algorithm
        os.remove('image.jpg')
        return jsonify(warn)
    
@app.route("/ping", methods=['GET'])
def ping():
    return "pong"

if __name__ == '__main__':
    app.run(debug=True)
