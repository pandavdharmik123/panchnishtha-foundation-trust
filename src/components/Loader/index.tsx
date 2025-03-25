import Image from 'next/image';
import './loader.scss';
const Loader= () => {
  return (
    <div className="cube-container">
      <div className="cube">
        <div className="face front"><Image src="/images/trust_icon.png" alt="Front" /></div>
        <div className="face back"><Image src="/images/trust_icon.png" alt="Back" /></div>
        <div className="face left"><Image src="/images/trust_icon.png" alt="Left" /></div>
        <div className="face right"><Image src="/images/trust_icon.png" alt="Right" /></div>
        <div className="face top"><Image src="/images/trust_icon.png" alt="Top" /></div>
        <div className="face bottom"><Image src="/images/trust_icon.png" alt="Bottom" /></div>
      </div>
    </div>
  )

}

export default Loader;