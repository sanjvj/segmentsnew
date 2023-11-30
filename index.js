document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('my-video');
    const topicsContainer = document.getElementById('topics-container');

    const segments = [
        { name: 'Introduction', duration: 40 },
        { name: 'Main Content', duration: 20},
        { name: 'Pre-conclusion', duration: 60 },
        { name: 'Conclusion', duration: 60 },
        
        // Add more segments as needed
    ];

    // Create and append topic elements
    segments.forEach((segment, i) => {
        const topicElement = document.createElement('div');
        topicElement.className = 'topic';
        topicElement.textContent = segment.name;
        topicElement.addEventListener('mouseup', () => {
            video.currentTime = i * segment.duration;
        });
        topicsContainer.appendChild(topicElement);
    });

    // Update the video time based on topic hover
    topicsContainer.addEventListener('mouseup', function (event) {
        const topicIndex = Array.from(topicsContainer.children).indexOf(event.target);
        const hoverTime = topicIndex * segments[topicIndex].duration;
        video.currentTime = hoverTime;
    });

    var player = videojs(
        'my-video',
        {
            controls: true,
            fluid: true,
            html5: {
                vhs: {
                    overrideNative: true
                }
            }
        },
        function () {
            var player = this;
            player.eme();
            player.src({
                src: 'https://cdn.bitmovin.com/content/assets/art-of-motion_drm/mpds/11331.mpd',
                type: 'application/dash+xml',
                keySystems: {
                    'com.widevine.alpha': 'https://cwip-shaka-proxy.appspot.com/no_auth',
                }
            });

            player.ready(function () {
                player.tech(true).on('keystatuschange', function (event) {
                    console.log("event: ", event);
                });

                // Add hover-over timing on the progress bar
                player.el().addEventListener('mousemove', function (event) {
                    const hoverPercent = player.controlBar.progressControl.seekBar.getPercent();
                    const hoverTime = hoverPercent * player.duration();
            
                    // Remove existing markers before adding new ones
                    const existingMarkers = player.controlBar.progressControl.el().getElementsByClassName('name');
                    for (let i = 0; i < existingMarkers.length; i++) {
                        existingMarkers[i].remove();
                    }
            
                    for (let i = 0; i < segments.length; i++) {
                        const marker = document.createElement('div');
                        marker.className = 'name';
                        marker.style.left = `${(i * segments[i].duration / player.duration()) * 100}%`;
                        marker.innerHTML = `${segments[i].name}`;
                        player.controlBar.progressControl.el().appendChild(marker);
                    }
                });

                player.controlBar.progressControl.on('mousemove', function (event) {
                    const hoverPercent = player.controlBar.progressControl.seekBar.getPercent();
                    const hoverTime = hoverPercent * player.duration();

                    // Remove existing markers before adding new ones
                    const existingMarkers = player.controlBar.progressControl.el().getElementsByClassName('dot-marker');
                    for (let i = 1; i < existingMarkers.length; i++) {
                        existingMarkers[i].remove();
                    }

                    for (let i = 1; i < segments.length; i++) {
                        const marker = document.createElement('div');
                        marker.className = 'dot-marker';
                        marker.style.left = `${(i * segments[i].duration / player.duration()) * 100}%`;
                        player.controlBar.progressControl.el().appendChild(marker);
                    }
                });
            });
            
           
            });
        }
    );
