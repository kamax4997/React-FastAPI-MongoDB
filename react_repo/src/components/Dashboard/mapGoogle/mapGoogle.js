import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';
import './mapGoogle.scss';
import image1 from './assetsMap/phone1.png';
import image2 from './assetsMap/phone2.png';
import image3 from './assetsMap/phone3.png';


export const MapGoogle = ({
    isCollabsed,
    setCollapsed
}) => {

    const containerStyle = {
        width: '100%',
        height: '100%'
    };
      
      const center = {
        lat: -3.745,
        lng: -38.523
      };

    const dataUsers = [
      {
        imglink: image1,
        centerimg: {
          lat: -3.745,
          lng: -38.523
        }
      },
      {
        imglink: image2,
        centerimg: {
          lat: -3.945,
          lng: -38.523
        }
      },
      {
        imglink: image3,
        centerimg: {
          lat: -4.145,
          lng: -38.523
        }
      },
    ]
    
    return(
        <div 
          className='collabsed-map'
          style={{
            width:  isCollabsed ? '100%' : '50%'
          }}
        >
            {!isCollabsed ? 
                <div 
                  className='collapsed-button'
                  onClick={() => setCollapsed(!isCollabsed)}
                >
                    <span className='text-collapse'>
                        Collapse Map
                    </span>
                </div> : null
            }
            <LoadScript
              googleMapsApiKey="AIzaSyBINjx92gyNUrgDKGMa8wT683gzdWmQ1vc"
            >
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
              >
                {dataUsers.map(({imglink,centerimg }) => (
                  <OverlayView
                    position={centerimg}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <img 
                      alt='img-map'
                      src={imglink}
                    />
                </OverlayView>
                ))}
                
              </GoogleMap>
            </LoadScript>
        </div>
    )
}