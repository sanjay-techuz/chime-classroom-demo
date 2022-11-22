import React ,{useState} from 'react';
import AWS from 'aws-sdk'

const S3_BUCKET ='chime-message-attachments';

AWS.config.update({
    accessKeyId: 'AKIAUMB57EQBTHOTTM45',
    secretAccessKey: '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'
})


const UploadImageToS3WithNativeSdk = () => {

    const [progress , setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imgSrc, setImgSrc] = useState("");

    const handleFileInput = (e:any) => {
        setSelectedFile(e.target.files[0]);
    }

    const uploadFile = (file:any) => {
        var upload = new AWS.S3.ManagedUpload({
            params: {
              Bucket: S3_BUCKET,
              Key: file.name,
              Body: file
            }
          }).on('httpUploadProgress', (evt) => {
                    setProgress(Math.round((evt.loaded / evt.total) * 100))
                });
        
          var promise = upload.promise();
        
          promise.then(
            function(data:any) {
              alert("Successfully uploaded photo.");
              console.log(data);
              setImgSrc(data.Location);
            },
            function(err:any) {
                console.log(err)
              return  err;
            }
          );
    }


    return <div>
        <div>Native SDK File Upload Progress is {progress}%</div>
        <input type="file" onChange={handleFileInput}/>
        <button onClick={() => uploadFile(selectedFile)}> Upload to S3</button>
        <img src={imgSrc} />
    </div>
}

export default UploadImageToS3WithNativeSdk;