const el = document.getElementById("h5p-container")
const options = {
    frameJs: '/assets/h5p-standalone/frame.bundle.js',
    frameCss: '/assets/h5p-standalone/styles/h5p.css'
}

new H5PStandalone.H5P(el,options);