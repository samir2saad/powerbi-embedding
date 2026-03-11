// Power BI Embedding Application
(function() {
    'use strict';

    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const infoPanel = document.getElementById('infoPanel');
    const reportContainer = document.getElementById('reportContainer');

    /**
     * Update status indicator
     */
    function updateStatus(status, message) {
        statusIndicator.className = `status-indicator ${status}`;
        statusText.textContent = message;
    }

    /**
     * Show error message
     */
    function showError(message) {
        updateStatus('error', 'Error occurred');
        reportContainer.innerHTML = `
            <div class="error-message">
                <strong>❌ Error Loading Report</strong>
                <p>${message}</p>
                <p style="margin-top: 10px; font-size: 12px;">
                    Please check the console for more details or verify your configuration.
                </p>
            </div>
        `;
    }

    /**
     * Show report information
     */
    function showReportInfo(data) {
        infoPanel.style.display = 'block';
        infoPanel.innerHTML = `
            <strong>Report Information:</strong>
            Report Name: ${data.reportName || 'N/A'}<br>
            Report ID: ${data.reportId}<br>
            Token Expiry: ${new Date(data.tokenExpiry).toLocaleString()}
        `;
    }

    /**
     * Embed Power BI Report
     */
    function embedReport(embedData) {
        try {
            // Get Power BI service and models
            const powerbi = window.powerbi;
            const models = window['powerbi-client'].models;

            // Power BI embed configuration
            const embedConfig = {
                type: 'report',
                id: embedData.reportId,
                embedUrl: embedData.embedUrl,
                accessToken: embedData.embedToken,
                tokenType: models.TokenType.Embed,
                permissions: models.Permissions.Read,
                viewMode: models.ViewMode.View,
                settings: {
                    panes: {
                        filters: {
                            expanded: false,
                            visible: false
                        },
                        //to hide navigation bar if we need to show one single page 
                        pageNavigation: {
                            visible: true
                        }
                    },
                    background: models.BackgroundType.Transparent,
                    layoutType: models.LayoutType.Custom,
                    customLayout: {
                        displayOption: models.DisplayOption.FitToWidth
                    },
                    bars: {
                        actionBar: {
                            visible: false
                        }
                    },
                    zoomLevel: 1,
                    filterPaneEnabled: false,
                    navContentPaneEnabled: false
                }
            };

            // Clear the container
            reportContainer.innerHTML = '';

            // Embed the report
            const report = powerbi.embed(reportContainer, embedConfig);

            // Prevent all zoom interactions
            const preventZoom = function(e) {
                // Prevent Ctrl+Wheel zoom
                if (e.ctrlKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                // Prevent touchpad pinch zoom (deltaY with ctrlKey)
                if (e.ctrlKey && e.deltaY) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            };

            // Add event listeners for zoom prevention
            reportContainer.addEventListener('wheel', preventZoom, { passive: false });
            reportContainer.addEventListener('mousewheel', preventZoom, { passive: false });
            reportContainer.addEventListener('DOMMouseScroll', preventZoom, { passive: false });
            
            // Prevent touchpad gestures
            reportContainer.addEventListener('gesturestart', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });
            
            reportContainer.addEventListener('gesturechange', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });
            
            reportContainer.addEventListener('gestureend', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });

            // Prevent keyboard zoom shortcuts
            document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
                    const activeElement = document.activeElement;
                    if (reportContainer.contains(activeElement) || activeElement === reportContainer) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            }, { passive: false });

            // Handle report load event
            report.on('loaded', function() {
                console.log('✓ Report loaded successfully');
                updateStatus('success', 'Report loaded successfully');
                
                // Disable zoom after report loads
                report.updateSettings({
                    zoomLevel: 1,
                    customLayout: {
                        displayOption: models.DisplayOption.FitToWidth
                    }
                }).catch(function(error) {
                    console.warn('Could not update zoom settings:', error);
                });
            });

            // Handle report render event
            report.on('rendered', function() {
                console.log('✓ Report rendered successfully');
                updateStatus('success', 'Report ready');
            });

            // Handle errors
            report.on('error', function(event) {
                console.error('Report error:', event.detail);
                showError(`Report error: ${event.detail.message || 'Unknown error'}`);
            });

            // Show report information
            showReportInfo(embedData);

        } catch (error) {
            console.error('Error embedding report:', error);
            showError(`Failed to embed report: ${error.message}`);
        }
    }

    /**
     * Fetch embed information from backend
     */
    async function fetchEmbedInfo() {
        try {
            updateStatus('loading', 'Fetching embed token...');
            
            const response = await fetch('/api/getEmbedInfo');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✓ Embed information received:', {
                reportId: data.reportId,
                reportName: data.reportName,
                tokenExpiry: data.tokenExpiry
            });
            
            updateStatus('loading', 'Embedding report...');
            embedReport(data);
            
        } catch (error) {
            console.error('Error fetching embed info:', error);
            showError(`Failed to fetch embed information: ${error.message}`);
        }
    }

    /**
     * Initialize the application
     */
    function init() {
        console.log('🚀 Initializing Power BI Embedding Demo...');
        
        // Check if Power BI client library is loaded
        if (typeof window.powerbi === 'undefined') {
            showError('Power BI client library failed to load. Please check your internet connection.');
            return;
        }

        // Fetch and embed the report
        fetchEmbedInfo();
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
