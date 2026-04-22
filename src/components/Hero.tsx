import DATA from '../data';
import Three from './Three';

function Hero() {
    return (
        <section className="hero" id="hero">
            <div className="hero-content">
                <div><span className="text-secondary uppercase">{DATA.HEADER}</span></div>
                <div className="hero-content-top">
                    <h1>{DATA.TITLE}</h1>
                    <p>{DATA.SUBTITLE}</p>
                </div>
                <div className="hero-content-bottom">
                    <div>
                        <p className="text-secondary">About | My Works</p>
                    </div>
                    <div>
                        <p className="text-secondary">{DATA.COMPANY}</p>
                    </div>
                    <div>
                        <p className="text-secondary">{DATA.LOCATION}</p>
                    </div>
                </div>
            </div>
            <div className="hero-canvas">
                <Three />
            </div>
        </section>
    )
}

export default Hero;