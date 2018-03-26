// ==UserScript==
// @name         Vallu Time Tracker Helper
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Fills "selite" (description) and "time" (aika) fields using url params: &selite=... ja &aika=... and saves the changes automatically.
// @author       Toni Dahl
// @license      MIT
// @match        https://guidance.solita.fi/*selite*aika*
// @run-at       document-body
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// ==/UserScript==

(function () {
    'use strict';

    var origOpen = window.XMLHttpRequest.prototype.open;
    var origSend = window.XMLHttpRequest.prototype.send;

    var allXHRDone = function () {
        return new window.Promise(function (resolve, reject) {
            var count = 0;

            function handleResponse() {
                count -= 1;

                if (count <= 0) {
                    count = 0;

                    // Cleanup
                    window.XMLHttpRequest.prototype.open = origOpen;
                    window.XMLHttpRequest.prototype.send = origSend;

                    resolve();
                }
            }

            window.XMLHttpRequest.prototype.open = function () {
                this.addEventListener("loadend", handleResponse.bind(this));
                origOpen.apply(this, arguments);
            };

            window.XMLHttpRequest.prototype.send = function () {
                count += 1;

                origSend.apply(this, arguments);
            };
        })
            .catch(function (e) {
                console.error(e);
            });
    };

    var tabJob = function (tabId) {
        var href = window.location.href;
        var url = new URL(href);
        var disableSave = url.searchParams.has("disableSave"); // Use this for skipping save
        var valSelite = url.searchParams.get("selite");
        var valAika = url.searchParams.get("aika");

        // Fill selite and aika input fields
        document.querySelector('#selitysInput').value = valSelite;
        document.querySelector('[name=tunnit]').value = valAika;

        // Finally, press save the form, by pressing "Tallenna"-button
        if (!disableSave) {
            setTimeout(function () {
                document.querySelector('#tallenna_nappi').click();
            });
        } else {
            return Promise.resolve();
        }

        // Race: Wait for all requests (after save) to complete, or wait max 10 seconds.
        return window.Promise.race([allXHRDone(),
            new window.Promise(function (resolve) {
                setTimeout(function () {
                    resolve('timeout');
                }, 10 * 1000);
            })]);
    };

    var setTabWorking = function (bool) {
        GM_getTab(function (tabObj) {
            tabObj.isWorking = !!bool;

            GM_saveTab(tabObj);
        });
    };

    var cleanTab = function () {
        GM_getTab(function (tabObj) {
            delete tabObj.id;
            delete tabObj.isWorking;

            GM_saveTab(tabObj);
        });
    };

    // The tabs will figure out individually who gets the next turn on executing a job.
    // Each tab is storing its creation time (here, referred as 'id'), which is used in this process.
    var queueJob = function (tabId, jobFn) {
        var pollerId;

        function pollTabs() {
            GM_getTabs(function (tabs) {
                var params = Object.values(tabs)
                    .filter(function (el) {
                        return el.id !== undefined;
                    })
                    .sort(function (a, b) {
                        return a.id - b.id;
                    });

                // console.log('Queue:', params.map(function(el){return el.id;}));

                // If the current tab is the first in the queue, start the job. The other tabs will check the queue
                // periodically until their turn is up.
                if (params.length && params[0].isWorking === false && tabId === params[0].id) {
                    setTabWorking(true);

                    jobFn()
                    // After the job  is done, we'll clean the stored tab data and stop polling the queue.
                        .then(function () {
                            cleanTab();
                            clearTimeout(pollerId);
                        });
                }
            });

            pollerId = setTimeout(pollTabs, 1000);
        }

        pollTabs();
    };


    // ### Init ###

    window.addEventListener('beforeunload', function (e) {
        cleanTab();
    });

    GM_getTab(function (tabObj) {
        // Generate an unique id for open tab
        tabObj.id = (new Date()).getTime();
        tabObj.isWorking = false;

        GM_saveTab(tabObj);

        // Vallu has to do some initial queries before we can modify and save the form.
        // Here, we'll wait for them to finish and then add our job function into queue.
        allXHRDone()
            .then(function () {
                queueJob(tabObj.id, tabJob);
            });
    });
})();