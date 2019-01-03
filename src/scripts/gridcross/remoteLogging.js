import { TIMEOUT } from './constants';

function logToRemote(itemId, values = {}) {
    if (typeof API_LOG_ENDPOINT === 'undefined') return;

    const {geometryCount = 0, moves = 0, responseTime = 0, correct = 0} = values;

    function handleTimeout() {
        request.open('GET', url);
        request.send();
        logErrorToRemote(url);
    }

    const url = `${API_URL}${API_LOG_ENDPOINT}?ps=${ps}&user=${user}&item=${itemId}&answer=${geometryCount}&correct=${correct}&moves=${moves}&responseTime=${responseTime}&cookieHash=${cookieHash}&deviceType=${deviceType}`;
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.timeout = TIMEOUT;
    request.onerror = () => {logErrorToRemote(url)};
    request.ontimeout = handleTimeout;
    request.onabort = () => {logErrorToRemote(url)};
    request.onloadstart = () => {if (LOG) console.log(`%clogging to remote: ${url}`, 'color: wheat')};
    request.onload = () => {if (LOG && request.status === 200) console.log(`%clogging to remote successful`, 'color: wheat')};
    request.send();
}


function logErrorToRemote(error) {
    if (typeof API_ERROR_ENDPOINT === 'undefined') return;

    const errorLogUrl = `${API_URL}${API_ERROR_ENDPOINT}?user=${user}&description=${encodeURIComponent(error)}`;
    const errorRequest = new XMLHttpRequest();
    errorRequest.open('GET', errorLogUrl);
    errorRequest.send();
}

export {logToRemote, logErrorToRemote};