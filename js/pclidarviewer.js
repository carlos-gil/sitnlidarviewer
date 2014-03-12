/**
* PCLVIEWER Point Cloud LiDAR data 3D Application
* Copyright (c) SITN, HEIG-VD, 2014
*/


/**
 * PCLVIEWER namespace.
 */
if (typeof PCLVIEWER == "undefined") {
    var PCLVIEWER = {};
        
        /**
         * PCLVIEWER.Viewer object
        */
        PCLVIEWER.Viewer = function (dataUrl) {
             this.dataUrl = dataUrl;
        };
        
        PCLVIEWER.Viewer.prototype = {
        
            /** 
            * Viewer constructor
            */
            constructor: PCLVIEWER.Viewer,
            
            /**
            * Load the data from fileCreatedDate => will be later modified for connection with las_extractor server application
            */
            loadData: function (){
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET",this.dataUrl,false);
                xmlhttp.send();
                txtDoc = xmlhttp.responseText; 
                this.data = txtDoc.split('\n');
            },
            /** data
            * ``String, CSV``
            * The data array: csv with headers: x,y,z,intensity,class,R,G,B
            */
            data: null,
            
            /** Change the z Amplification factor => typical example for modifications through user interface
            * ``Float``
            */
            zFactor: 1,
            
            /** Particle size => typical example for modifications through user interface
            * ``Int``
            */
            particleSize: 1,
            
            /** Particle system
            * ``THREE.ParticleSystem``
            */            
            particleSystem: null,
            /** Create the particle sytem
            * Create an instance of ``THREE.ParticleSystem`` 
            */
            createParticleSystem: function (minX,minY,minZ) {
            
                // Create the geometry instance => we could try to use THREE.BufferGeometry for better performances here...
                var geometry = new THREE.Geometry(); 

                // Parse the points and create geometry
                var pointNumber = this.data.length;
                var colors = [];

                for (var i=0; i < pointNumber; i++) {
                    // Parse the string line into js array
                    var line = this.data[i].split(',');
                    
                    // get the coordinates (please mind the referential change !)
                    var x = parseFloat(line[0] - minY);
                    var z = parseFloat(line[1] - minX);
                    var y = parseFloat(line[2] - minZ) * this.zFactor;  

                    // create the point geometry
                    geometry.vertices.push(new THREE.Vector3(x, y, z));
                    
                    // Colors: must be int the [0;1] interval
                    colors.push({r:line[5]/255,g:line[6]/255,b:line[7]/255});
                    
                }

                geometry.colors = colors;

                // Define the material
                var material = new THREE.ParticleSystemMaterial({ 
                    size: this.particleSize, 
                    vertexColors: true
                });

                // Create a particle system
                
                this.particleSystem = new THREE.ParticleSystem(geometry,material);
                this.particleSystem.rotation.y = Math.PI * 45 / 180;
                return;
            },
            
            startViewer: function () {
                
                // Load the data
                this.loadData();
               
                // Get the browser window's size
                var width = window.innerWidth;
                var height = window.innerHeight; 

                // Set up the renderer
                var renderer = new THREE.WebGLRenderer({ 
                    antialias: true,
                    alpha: true
                });
                renderer.setSize(width, height);
                
                document.body.appendChild(renderer.domElement);
                 
                // Create the scene
                var scene = new THREE.Scene();

                // Define the required offsets required to display the cloud in the center of the screen
                // This should later be calculated server-side
                // For developpement, manually change these parameters
                
                var minX = 204900;
                var minY = 562000;
                var minZ = 429;
                
                // Create the particle sytem
                this.createParticleSystem(minX, minY, minZ);
                var particleSystem = this.particleSystem;
                // Add the system to the scene
                scene.add(particleSystem);

                // Camera setup
                var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
                camera.position.y = 160;
                camera.position.z = 400;
                camera.lookAt(this.particleSystem.position);
                scene.add(camera);

                // Add a light
                var pointLight = new THREE.PointLight(0xffffff, 100, 100);
                pointLight.position.set(2, 100, 100);
                scene.add(pointLight);

                // Render the scene with rotating animation

                // for animation, we need a timer
                var clock = new THREE.Clock();
                
                // Dynamic rendering

                function render() {
                    renderer.render(scene, camera);
                    particleSystem.rotation.y -= clock.getDelta();
                    requestAnimationFrame(render);
                }

                render();
            }
        };
}