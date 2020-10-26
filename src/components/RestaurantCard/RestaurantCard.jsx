import React, { useState, useEffect } from "react";
import "./Restaurant.css";
import axios from "axios"; 
import { GoogleMap, Marker } from "@react-google-maps/api";
import useReactRouter from "use-react-router";  
import curry from "../../image/indian36by49.jpg"; 
import {listObjects, getSingleObject} from "../../utils/index"; 
import { MediaStoreData } from "aws-sdk";
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


export default function RestaurantCard({match}){

    //map 
    const [ info, setInfo ] = useState([]); 
    const [ currentCenter , setCurrentCenter ] = useState({}); 
    //picture 
    const [ dataFromS3, setdataFromS3] = useState([]);
    const [ imageData, setimageData] = useState(""); 
    const [ images, setImages] = useState([]); 

    const { history, location} = useReactRouter(); 

    const mapStyles = {
        margin: "0 auto",
        height: "50vh",
        width: "70%",
        boxShadow: "0 4px 8px grey",
        marginTop: "30px",
        marginBottom: "50px",
        borderRadius: "30px"
      };

useEffect(()=>{
    async function initMap(){
        const res = await axios.get(`https://cc14polyglottal-app.herokuapp.com/api/v1/restaurants/${match.params.id}`);
        const data = res.data; 
        let temp = [];  
        for (let key in data) {
            temp.push(data[key]);
          }
          setInfo(temp); 
          console.log("temp",temp[5])

          // initialize google-map, set lat and lng
          var geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({address: temp[5]}, function(results, status){
              if(status === "OK" && results[0]){
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();
                console.log("lat",lat); 
                console.log("lng",lng); 

                const updateCenter = {
                lat: lat,
                lng: lng,
                };
                setCurrentCenter(updateCenter); 
                  }
              }
          )
        }
        initMap(); 
            },[])

    //fetch data from backet 
    useEffect(()=>{
        async function fetchImageData
        (){
            const arrayOfPhotoObjects = await listObjects();
            const result = arrayOfPhotoObjects.map(obj=>obj.Key); 
            setdataFromS3(result); 
        }
        fetchImageData
        ();
    },[]); 

    //convert data into array of image data 
    useEffect(()=>{
        async function getImage(photoArray){
            const result = []; 
            for (const photo of photoArray){
                let photoObj = {
                    key: photo,
                    bit: await getSingleObject(photo)
                };
                console.log('photoObj',photoObj); 
                result.push(photoObj); 
            }
            setimageData(result);
        }
        getImage(dataFromS3);
    }, [dataFromS3]); 
    console.log('imagedata', imageData); 

    //create image element for eatch element in data 
    useEffect(() =>{
        let result = [];
        for ( let i = 0; i < imageData.length; i++){
            const img = (
                <div className="imgCell">
                    <img
                    src={`data:image/png;base64,${imageData[i].bit}`}
                    key={imageData[i].key}
                    className="image" />
                </div>
            );
            result.push(img); 
        };
        setImages(result);
    }, [imageData]); 

    return(
        <div>
                        {/* <div id="imageContainer"> */}

            <Slider className="imgSlider" dots="true" infinite={true} speed={500} slidesToShow={1} slidesToScroll={1}>
            {images}
            </Slider>
            {/* </div> */}

            <ul>
                <li>name: {info[4]}</li>
                <li>feature: {info[3]}</li>
                <li>place: {info[5]}</li>
                <li>business hour: {info[0]}</li>
                <li>business hour(evening): {info[1]}</li>
                <li>regular holiday: {info[6]}</li>
                <li>TELL: {info[7]}</li>
                <li>URL: {info[8]}</li>
                <li>comment: {info[2]}</li>

           </ul>
           <div>
           <input type="submit" value="HOME" onClick={()=>history.push(`/`)} />
           </div>
           <div className="map_wrapper">
                <GoogleMap
                mapContainerStyle={mapStyles}
                zoom={14}
                center={currentCenter} 
                >
                    {
                    currentCenter.lat &&
                    ( 
                    <Marker 
                    position={currentCenter}
                    icon={curry}/>
                    ) 
                }
                </GoogleMap>
        </div>
        </div>
        
    )
}
