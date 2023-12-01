document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('my-video');
    const topicsContainer = document.getElementById('topics-container');
    let isHoveringProgressBar = false;

    const segments = [
        { name: 'Introduction', duration: 60 },
        { name: 'Main Content', duration: 60 },
        { name: 'Pre-conclusion', duration: 60 },
        { name: 'Conclusion', duration: 60 },
        // Add more segments as needed
    ];


    segments.forEach((segment, i) => {
        const topicElement = document.createElement('div');
        topicElement.className = 'topic';
        topicElement.textContent = segment.name;
        topicElement.addEventListener('mouseup', () => {
            video.currentTime = i * segment.duration;
        });
        topicsContainer.appendChild(topicElement);
    });

    // Create a tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    // Create markers for each segment
  
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

                document.addEventListener('mousemove', function (event) {
                    if (isHoveringProgressBar) {
                        const progressRect = player.controlBar.progressControl.el().getBoundingClientRect();
                        const hoverPercent = (event.clientX - progressRect.left) / progressRect.width;
                        const hoverTime = hoverPercent * player.duration();

                        let hoveredSegment = null;

                        for (let i = 0; i < segments.length; i++) {
                            if (hoverTime <= totalDuration(segments.slice(0, i + 1))) {
                                hoveredSegment = segments[i];
                                break;
                            }
                        }

                        if (hoveredSegment) {
                            // Update tooltip content with the segment name
                            tooltip.textContent = hoveredSegment.name;

                            // Position the tooltip dynamically with the cursor near the progress bar
                            const tooltipTop = event.clientY+320;
                            const tooltipLeft = event.clientX;

                            tooltip.style.top = `${tooltipTop}px`;
                            tooltip.style.left = `${tooltipLeft}px`;
                            tooltip.style.display = 'block';
                        } else {
                            // Hide the tooltip when not hovering over a segment
                            tooltip.style.display = 'none';
                        }
                    }
                });

                // Set the flag when the mouse enters the progress bar
                player.controlBar.progressControl.on('mouseover', function (event) {
                    isHoveringProgressBar = true;
                });

                // Reset the flag when the mouse leaves the progress bar
                player.controlBar.progressControl.on('mouseout', function (event) {
                    isHoveringProgressBar = false;
                    tooltip.style.display = 'none';
                });

                // Remove existing markers before adding new ones
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
});

// Calculate the total duration of all segments
function totalDuration(segments) {
    return segments.reduce((total, segment) => total + segment.duration, 0);
}
