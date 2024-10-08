const btn = document.getElementById("btn");
const image = document.getElementById("image");
const inputImage = document.getElementById("input_image");
const imageContainer = document.getElementById("input_image_container");
const canvas = document.getElementById("image_canvas");
const ctx = canvas.getContext("2d");


image.addEventListener("change", function(event){
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const img = new Image();
        const reader = new FileReader();   
        
        reader.onload = function(e) {
            img.onload = function() {
              
                canvas.width = 100;
                canvas.height = 100;
                
                ctx.drawImage(img, 0, 0, 100, 100);
                
                const resizedImageURL = canvas.toDataURL('image/jpeg');
                
                inputImage.src = resizedImageURL;
                
                imageContainer.style.display = 'block';
            }
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
})

btn.addEventListener("click", async function(){
    await predict_emotion();
})

async function predict_emotion(){
        let input = document.getElementById("input_image");
        let step1 = tf.browser.fromPixels(input).resizeNearestNeighbor([48,48]).mean(2).toFloat().expandDims(1).expandDims(-1).div(255.0)     
        const tensorData = step1.dataSync(); 
        const arrayData = Array.from(tensorData); 
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: arrayData }), 
        });
        
        const data = await response.json(); 
        const result = data.prediction; 
        
        emotions = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]
        const output = document.getElementById("output_chart");
        output.innerHTML = "";
        let max_val = 0;
        let max_val_index = -1;
    
        for (let i = 0; i < result[0].length; i++) {
            const style_text = `width: ${result[0][i] * 150}px; height: 20px; background-color: aliceblue;`;
            output.innerHTML += `
                <tr>
                    <td>${emotions[i]}(${result[0][i] * 100}): </td>
                    <td><div style='${style_text}'></div></td>
                </tr>`;
            if (result[0][i] > max_val) {
                max_val = result[0][i];
                max_val_index = i;
            }
        }
    
        const EMOTION_DETECTED = emotions[max_val_index];
        document.getElementById("output_chart").style.display = "table";
        document.getElementById("output_text").innerHTML = `
            <p>Emotions and corresponding scaled up probability</p>
            <p>Emotion detected: ${EMOTION_DETECTED} (${(max_val * 100).toFixed(2)}% probability)</p>`;
    }