import { timeParse, timeFormat } from "d3-time-format";
import * as Papa from "papaparse"
import { ALIASES } from "@/data-dict"

function renameKeys(d, headers) {


    let out = {};
    Object.keys(d).forEach(function (key) {
        out[headers[key]] = d[key];
    });
    return out;

}

function toItemsArray(obj) {

    let out = [];
    for (let key in obj) {
        out.push({ value: key, text: obj[key] });
    }
    return out;
}

function trimHeaders(arr, headers) {

    return headers.reduce((acc, curr) => {
        acc[curr] = arr[curr];
        return acc;
    }, {});
}

function jsonToGeoJson(data, headers) {
    //   Trim keys
    let headerKeys = Object.keys(headers)
    let features = data.map((o, i) => {
        return {
            type: "Feature", id: i, geometry: o.geometry,
            properties: renameKeys(replaceAliases(trimHeaders(o.properties, headerKeys)), headers)
        }
    });

    // The content
    let collection = { type: "FeatureCollection", features: features };
    return JSON.stringify(collection);
}

function replaceAliases(d) {

    for (let key in d) {
        let aliases = ALIASES[key];
        if (aliases) {
            d[key] = aliases[d[key]] || d[key];
        }
    }
    return d;


}

function jsonToCSV(data, headers) {

    let headerKeys = Object.keys(headers)
    return Papa.unparse(
        //   Add lat/lng
        data.map((d) => {
            // Properties and geometry
            let out = d.properties;
            let geo = d.geometry;

            //   Get the lat/lng
            if (geo) {
                out["lng"] = geo.coordinates[0];
                out["lat"] = geo.coordinates[1];
            } else {
                out["lng"] = null;
                out["lat"] = null;
            }

            // Trim to the right columns
            return renameKeys(replaceAliases(trimHeaders(out, headerKeys)), headers);
        })
    );
}

function downloadFile(content, contentType, fileName) {

    // Create the link
    const a = document.createElement("a");

    // Create object to download
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);

    // Set the file name
    a.download = fileName;

    // Trigger download
    a.click();

}


async function githubFetch(filename) {
    /* Fetch data from Github */

    let url = "https://raw.githubusercontent.com/PhiladelphiaController/gun-violence-dashboard-data/master/gun_violence_dashboard_data/data/processed/"
    try {
        const response = await fetch(url + filename);
        let data = await response.json();
        return data
    } catch (e) {
        console.error(e);
    }
}

async function AWSFetch(filename) {
    /* Fetch data from AWS s3 */

    let url = "https://gun-violence-dashboard.s3.amazonaws.com/"
    try {
        const response = await fetch(url + filename);
        let data = await response.json();
        return data
    } catch (e) {
        console.error(e);
    }
}

function dateFromDay(year, day) {
    /* Returns a date object from a year and day of the year. */
    let date = new Date(year, 0); // initialize a date in `year-01-01`
    return new Date(date.setDate(day)); // add the number of days
}

function formatDate(year, day) {
    /* Returns a string of the form `YYYY-MM-DD` from a year and day of the year. */
    let dt = dateFromDay(year, day);
    return dt.toLocaleString("default", { month: "short", day: "numeric" });
}

function getDayOfYear(dt) {
    /* Get the day of the year from a Date object */
    let start = new Date(dt.getFullYear(), 0, 0);
    let diff =
        dt -
        start +
        (start.getTimezoneOffset() - dt.getTimezoneOffset()) * 60 * 1000;
    let oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}


function formatNumber(d) {
    /* Format a number with comma separator. */
    return d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getMsSinceMidnight(d) {
    /* Get the number of milliseconds since midnight */
    var e = new Date(d);
    return d - e.setHours(0, 0, 0, 0);
}

function msToTimeString(ms) {
    /* Convert milliseconds to a string of the form `HH:MM:SS.mmm` */
    let x = ms / 1000;
    x /= 60;
    let minutes = Math.floor(x % 60);
    x /= 60;
    let hours = Math.floor(x % 24);
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
const parseTime = timeParse("%Y/%m/%d %H:%M:%S");

function timestampToTimeString(ts, pattern = "%B %d") {
    const dt = new Date(ts);
    const formatTime = timeFormat(pattern);
    return formatTime(dt);

}

export {
    timestampToTimeString,
    dateFromDay,
    formatDate,
    getDayOfYear,
    formatNumber,
    getMsSinceMidnight,
    msToTimeString,
    githubFetch,
    parseTime,
    downloadFile,
    jsonToCSV,
    jsonToGeoJson,
    toItemsArray,
    AWSFetch
};
