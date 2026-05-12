import ProfilePic from './../assets/profile.jpg'
import Button from './Button';
import ProfilePicture from './ProfilePicture';
function Card() {
    
    const image = "https://yt3.googleusercontent.com/LcO8enDkr1A0lLG-MixTQJQufe1oFv8sctvD3WhYuvwwCmLcN0WuTe2qGC_ZqzpXlJ6EN6_dbQ=s160-c-k-c0x00ffffff-no-rj"
    return(
       <div className="card">
        <img className='card-image' src={ProfilePic} alt="image"></img>
        <ProfilePicture></ProfilePicture>
        <h2 className="card-title">Test H2</h2>
        <p className='card-text'>Test p</p>
        <Button></Button>
       </div>
    );
}

export default Card ;