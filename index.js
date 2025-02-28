require("dotenv").config();

const axios = require('axios');
const FormData = require('form-data');

const instance = axios.create({
    withCredentials: true, // Permite el uso de cookies
});

const mail = process.env.MAIL;
const pass = process.env.PASS;
const box = process.env.BOX;
const time = process.env.TIME;
const host = process.env.HOST;
const ruzafaHost = process.env.RUZAFA_HOST;
const club = process.env.CLUB;

let cookieHeader = null;

function setCookieHeader(response) {
    const setCookie = response.headers["set-cookie"];

    if (!setCookie) {
        throw new Error("No se recibieron cookies en la respuesta.");
    }

    // Unir cookies en un solo string (Axios necesita esto)
    cookieHeader = setCookie.join("; ");
}

function getFormattedDatePlus2() {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return yyyy.toString() + mm.toString() + dd.toString();
}

async function login() {
    let data = new FormData();
    data.append('loginiframe', '0');
    data.append('mail', mail);
    data.append('pw', pass);
    data.append('login', 'Iniciar sesión');

    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${host}/login`,
    headers: { 
        ...data.getHeaders()
    },
    data : data
    };
    return instance.request(config)
    .then((response) => {
        setCookieHeader(response);
        return response.data;
    })
    .catch((error) => {
        console.log(error);
    });
}

async function getBooking(formattedToday) {
    const today = new Date();
    const uri = `${ruzafaHost}/api/bookings?day=${formattedToday}&familyId=&box=${box}&_=${today.getTime()}`;
    return instance.get(uri, { 
        headers: {
            Cookie: cookieHeader
        }}).then((response) => response.data);
}

async function book(formattedTodayPlus2, booking) {
    const uri = `${ruzafaHost}/api/book`;
    let data = new FormData();
    data.append('id', booking?.id);
    data.append('day', formattedTodayPlus2);
    data.append('insist', '0');
    data.append('familyId', '');

    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: uri,
    headers: { 
        ...data.getHeaders(),
        Cookie: cookieHeader
    },
    data : data
    };

    return instance.request(config).then((response) => response.data)
}


async function main() {
    await login();
    const formattedTodayPlus2 = getFormattedDatePlus2();
    const result = await getBooking(formattedTodayPlus2);
    const booking = result.bookings.find((booking) => booking.className == `${club}` && booking.time == `${time}`);
    if (booking != undefined) {
        const bookresult = await book(formattedTodayPlus2, booking);
        console.log(bookresult)
    } else {
        console.log(`No book results in ${club} at date:${formattedTodayPlus2} and time: ${time}`);
    }
}

main();
