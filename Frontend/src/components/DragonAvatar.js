import React, { Component } from 'react';

const slenderImg = new URL('../assets/slender.png', import.meta.url).href;
const stockyImg = new URL('../assets/stocky.png', import.meta.url).href;
const sportyImg = new URL('../assets/sporty.png', import.meta.url).href;
const skinnyImg = new URL('../assets/skinny.png', import.meta.url).href;

const plainPatternImg = new URL('../assets/plain.png', import.meta.url).href;
const stripedPatternImg = new URL('../assets/striped.png', import.meta.url).href;
const spottedPatternImg = new URL('../assets/spotted.png', import.meta.url).href;
const patchyPatternImg = new URL('../assets/patchy.png', import.meta.url).href;

const propertyMap = {
    backgroundColor: {
        black: '#263238',
        white: '#cfd8dc',
        green: '#a5d6a7',
        blue: '#0277bd',
        multicolor: '#f489d2',
        copper: '#e38800'
    },
    build: {
    slender: slenderImg,
    stocky: stockyImg,
    sporty: sportyImg,
    skinny: skinnyImg
},
pattern: {
    plain: plainPatternImg,
    striped: stripedPatternImg,
    spotted: spottedPatternImg,
    patchy: patchyPatternImg
},
    size: { tiny: 60, small: 100, medium: 140, large: 180, enormous: 220 }
};

class DragonAvatar extends Component {
    get DragonImage() {
        const dragonPropertyMap = {};
        this.props.dragon.traits.forEach(trait => {
             console.log(trait);
            const { traitType, traitValue } = trait;
            dragonPropertyMap[traitType] = propertyMap[traitType][traitValue];
        });
console.log(dragonPropertyMap);
        const { backgroundColor, build, pattern, size } = dragonPropertyMap;

        const sizing = { width: size || 150, height: size || 150 };

        return (
            <div className='dragon-avatar-image-wrapper'>
                <div className='dragon-avatar-image-background' style={{ backgroundColor, ...sizing }}></div>
                <img src={pattern} className='dragon-avatar-image-pattern' style={sizing} alt="pattern" />
                <img src={build} className='dragon-avatar-image' style={sizing} alt="build" />
            </div>
        );
    }

    render() {
        const { generationId, dragonId, traits } = this.props.dragon;
        if (!dragonId) return <div></div>;
        return (
            <div>
                <span>G{generationId}.</span>
                <span>I{dragonId}. </span>
                {traits.map(trait => trait.traitValue).join(', ')}
                {this.DragonImage}
            </div>
        );
    }
}

export default DragonAvatar;