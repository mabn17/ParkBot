import React from 'react';
import BackgroundTimer from 'react-native-background-timer'; // yarn add

const Intervals = {
    start: () => {
        BackgroundTimer.setInterval(() => {
            console.log("Tic");
            BackgroundTimer.clearInterval(this);
        }, 2000);
    },
    clearStart: () => {
        BackgroundTimer.clearInterval(this.start);
    }
};

export default Intervals;