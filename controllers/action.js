const schedule = require('node-schedule');
const {keyboard, inline_keyboard, create_keyboard} = require('../keyboard');
const {message, action} = require('../string');
const {PrayTimes} = require('../praytimes');
const {Markup} = require('telegraf');
const nodeGeocoder = require('node-geocoder');
const timezone = require('node-google-timezone');

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GOOGLE_GEOCODER,
    formatter: null,
    language: 'fa'
};
const geocoder = nodeGeocoder(options);

let start = {
    send_location: ctx => {
        ctx.editMessageReplyMarkup(Markup);
        ctx.replyWithHTML(message.send_location, create_keyboard(keyboard.send_location, {resize_keyboard: true}));
    },
    choose_city: ctx => {
        ctx.editMessageText('استان مورد نظر را انتخاب کنید.', create_keyboard(inline_keyboard.select_province(), {inline_keyboard: true}));
    },
    province: ctx => {
        ctx.editMessageText('شهر مورد نظر را انتخاب کنید.', create_keyboard(inline_keyboard.select_city(ctx.update.callback_query.data), {inline_keyboard: true}));
    },
    city: ctx => {
        let method = 'Tehran',
            city = ctx.match;
        geocoder.geocode(city, (err, res) => {
            if (err) {
                ctx.reply(message.error, create_keyboard(inline_keyboard.start, {inline_keyboard: true}));
                return;
            }
            let coords = [res[0].latitude, res[0].longitude];
            timezone.data(coords[0], coords[1], new Date().getTime() / 1000, (err, tz) => {
                if (err) {
                    ctx.reply(message.error, create_keyboard(inline_keyboard.start, {inline_keyboard: true}));
                    return;
                }
                let {dstOffset, rawOffset} = tz.raw_response;
                rawOffset /= 3600;
                dstOffset /= 3600;
                ctx.session.default_config = {
                    method,
                    city,
                    coords,
                    raw_offset: rawOffset,
                    dst_offset: dstOffset
                };
                ctx.editMessageText(message.location_saved + '\n\n' + message.what_next, create_keyboard(inline_keyboard.home, {inline_keyboard: true}));
            });

        });
    }
};


let get_owghat = ctx => {
    let {city, method, coords, raw_offset, dst_offset} = ctx.session.default_config;
    let times = new PrayTimes(method).getTimes(new Date(), coords, raw_offset, dst_offset);
    ctx.editMessageText(message.pray_times(times, city), create_keyboard(inline_keyboard.owghat_recieved, {
        inline_keyboard: true,
        extra: {parse_mode: 'HTML'}
    }));
    ctx.session.current_action = action.get_owghat;
};

let another_city = ctx => {
    ctx.reply(message.start(ctx.from.first_name), create_keyboard(keyboard.start, {resize_keyboard: true}))
};

let settings = {
    start: ctx => {
        ctx.editMessageText(message.settings.start, create_keyboard(inline_keyboard.settings.start, {inline_keyboard: true}));
        ctx.session.current_action = action.settings.start;
    },
    azan: {
        start: ctx => {
            let {sobh, zohr, maghreb, all} = ctx.session.settings.azan;
            ctx.editMessageText(message.settings.azan.start, create_keyboard(inline_keyboard.settings.azan([sobh, zohr, maghreb, all]), {inline_keyboard: true}));
            ctx.session.current_action = action.settings.azan.start;
        },
        sobh: ctx => {
            let {sobh} = ctx.session.settings.azan;
            ctx.editMessageText(message.settings.azan.sobh(sobh), create_keyboard(inline_keyboard.return, {
                inline_keyboard: true,
                extra: {parse_mode: 'HTML'}
            }));
            ctx.session.current_action = action.settings.azan.sobh;
            ctx.session.settings.azan.sobh = !ctx.session.settings.azan.sobh && true;
            ctx.session.settings.azan.all = check_all(ctx.session.settings.azan);
            schedule_azan(ctx);
        },
        zohr: ctx => {
            let {zohr} = ctx.session.settings.azan;
            ctx.editMessageText(message.settings.azan.zohr(zohr), create_keyboard(inline_keyboard.return, {
                inline_keyboard: true,
                extra: {parse_mode: 'HTML'}
            }));
            ctx.session.current_action = action.settings.azan.zohr;
            ctx.session.settings.azan.zohr = !ctx.session.settings.azan.zohr && true;
            ctx.session.settings.azan.all = check_all(ctx.session.settings.azan);
            schedule_azan(ctx);
        },
        maghreb: ctx => {
            let {maghreb} = ctx.session.settings.azan;
            ctx.editMessageText(message.settings.azan.maghreb(maghreb), create_keyboard(inline_keyboard.return, {
                inline_keyboard: true,
                extra: {parse_mode: 'HTML'}
            }));
            ctx.session.current_action = action.settings.azan.maghreb;
            ctx.session.settings.azan.maghreb = !ctx.session.settings.azan.maghreb && true;
            ctx.session.settings.azan.all = check_all(ctx.session.settings.azan);
            schedule_azan(ctx);
        },
        all: ctx => {
            let {all} = ctx.session.settings.azan;
            ctx.editMessageText(message.settings.azan.all(all), create_keyboard(inline_keyboard.return, {
                inline_keyboard: true,
                extra: {parse_mode: 'HTML'}
            }));
            ctx.session.current_action = action.settings.azan.all;
            let new_all = !ctx.session.settings.azan.all && true;
            ctx.session.settings.azan = Object.assign(ctx.session.settings.azan, {
                sobh: new_all,
                zohr: new_all,
                maghreb: new_all,
                all: new_all
            });
            schedule_azan(ctx);
        }
    },
    ghaza: {}
};

let ret = ctx => {
    console.log(ctx.session.current_action);
    switch (ctx.session.current_action) {
        case action.get_owghat:
        case action.settings.start:
            ctx.editMessageText(message.what_next, create_keyboard(inline_keyboard.home, {inline_keyboard: true}));
            break;
        case action.settings.azan.start:
            settings.start(ctx);
            break;
        case action.settings.azan.sobh:
        case action.settings.azan.zohr:
        case action.settings.azan.maghreb:
        case action.settings.azan.all:
            settings.azan.start(ctx);
            break;
    }
};

let check_all = azan => {
    let {sobh, zohr, maghreb} = azan;
    return sobh && zohr && maghreb;
};

let schedule_azan = ctx => {
    schedule_azan_based_on_settings(ctx); // every time change  settings schedules must be change

    const rule = new schedule.RecurrenceRule();
    rule.hour = 1;
    rule.minute = 0;
    schedule.scheduleJob(ctx.from.id.toString(), rule, () => {
        schedule_azan_based_on_settings(ctx);
    });

    console.log(schedule.scheduledJobs);
};

let schedule_azan_based_on_settings = ctx => {
    let {city, method, coords, rawOffset, dstOffset} = ctx.session.default_config;
    let {sobh, zohr, maghreb} = ctx.session.settings.azan;
    let {fajr, dhuhr, maghrib} = new PrayTimes(method).getTimes(new Date(), coords, rawOffset, dstOffset);

    let sobh_name = ctx.from.id + ':sobh';
    let zohr_name = ctx.from.id + ':zohr';
    let maghreb_name = ctx.from.id + ':maghreb';

    if (schedule.scheduledJobs[sobh_name]) schedule.scheduledJobs[sobh_name].cancel();
    if (schedule.scheduledJobs[zohr_name]) schedule.scheduledJobs[zohr_name].cancel();
    if (schedule.scheduledJobs[maghreb_name]) schedule.scheduledJobs[maghreb_name].cancel();

    if (sobh) {
        let azan_name = 'صبح';
        schedule_on_time(ctx, fajr, sobh_name, azan_name, city);
    }

    if (zohr) {
        let azan_name = 'ظهر';
        schedule_on_time(ctx, dhuhr, zohr_name, azan_name, city);
    }

    if (maghreb) {
        let azan_name = 'مغرب';
        schedule_on_time(ctx, maghrib, maghreb_name, azan_name, city);
    }
};

let schedule_on_time = (ctx, time, schedule_name, azan_name, city) => {
    time = time.split(":");
    schedule.scheduleJob(schedule_name, {
        hour: time[0],
        minute: time[1]
    }, () => {
        ctx.replyWithHTML('<b>' + 'اذان ' + azan_name + ' به افق ' + city + '</b>');
    });
};

exports.start = start;
exports.get_owghat = get_owghat;
exports.another_city = another_city;
exports.settings = settings;
exports.return = ret;