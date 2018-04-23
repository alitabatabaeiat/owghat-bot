const {province, cities} = require('./iran');

module.exports = {
    message: {

        inactive: 'با عرض پوزش در حال حاضر غیرفعال!\n\nچه کمکی از من برمیاد؟', // dev

        start: (first_name) => {
            return 'سلام ' + first_name + '!\n' + 'خوش اومدی!\n' + 'برای اینکه بخوای از بات استفاده کنی اول باید یک موقعیت پیشفرض رو برای من مشخص کنی!\nموقعیت جغرافیاییت رو برای من ارسال کن یا یکی از شهر ها رو انتخاب کن!'
        },
        error: 'خطا! لطفا دوباره تلاش کنید.',
        // what_next: 'چیکار میتونم برات انجام بدم؟',
        home: 'در صفحه اصلی هستی!\nچه کاری ازم برات برمیاد؟',
        select_province: 'استان مورد نظر را انتخاب کنید.',
        select_city: 'شهر مورد نظر را انتخاب کنید.',
        pray_times: (times, city) => {
            return 'اوقات شرعی امروز ' + city + ':\n\n' +
                '<b>' + 'اذان صبح: ' + '</b>' + times.fajr + '\n' +
                '<b>' + 'طلوع خورشید: ' + '</b>' + times.sunrise + '\n' +
                '<b>' + 'اذان ظهر: ' + '</b>' + times.dhuhr + '\n' +
                '<b>' + 'غروب خورشید: ' + '</b>' + times.sunset + '\n' +
                '<b>' + 'اذان مغرب: ' + '</b>' + times.maghrib + '\n' +
                '<b>' + 'نیمه شب شرعی: ' + '</b>' + times.midnight + '\n\n' +
                'دیگه چه کاری میتونم برات انجام بدم؟'
        },
        change_city: 'شهر موردنظر را انتخاب کرده یا موقعیت جغرافیایی خود را برای من بفرستید!',
        settings: {
            start: 'خب! چه چیزی رو میخوای تنظیم کنی؟',
            azan: {
                start: 'برای کدام یک از اذان ها میخوای اطلاع رسانی کنم؟',
                sobh: active => {
                    return 'اطلاع رسانی برای اذان صبح ' + `<b>${is_active(!active)}</b>` + ' شد'
                },
                zohr: active => {
                    return 'اطلاع رسانی برای اذان ظهر ' + `<b>${is_active(!active)}</b>` + ' شد'
                },
                maghreb: active => {
                    return 'اطلاع رسانی برای اذان مغرب ' + `<b>${is_active(!active)}</b>` + ' شد'
                },
                all: active => {
                    return 'اطلاع رسانی برای تمام اذان ها ' + `<b>${is_active(!active)}</b>` + ' شد.'
                },
            },
            ghaza: {
                start: '',
            }
        }
    },
    button: {
        send_location: '🗺 ارسال موقعیت',
        select_city: '🏙 انتخاب شهر',
        provinces: province,
        all_cities: () => {
            let array = [];
            for (let i = 0; i < province.length; i++) {
                let city = cities(i);
                for (c in city)
                    if (city.hasOwnProperty(c))
                        array.push(c);
            }
            return array;
        },
        get_owghat: '🕌 اوقات شرعی',
        go_home: '🏠 خانه',
        settings: {
            start: '⚙️ تنظیمات',
            azan: {
                start: 'اطلاع رسانی اذان',
                sobh: active => {
                    return 'صبح: ' + is_active(active)
                },
                zohr: active => {
                    return 'ظهر: ' + is_active(active)
                },
                maghreb: active => {
                    return 'مغرب: ' + is_active(active)
                },
                all: active => {
                    return (is_active(!active) + ' کردن همه')
                }
            },
            ghaza: {
                start: 'یادآوری نماز'
            },
        },
        make_default: '💾 ذخیره اطلاعات',
        change_city: '🏙 شهر دیگر',
        return: '🔙 بازگشت'
    },
    action: {
        settings: {
            start: 'start_settings',
            azan: {
                start: 'notif_azan',
                sobh: 'azan_sobh',
                zohr: 'azan_zohr',
                maghreb: 'azan_maghreb',
                all: 'azan_all'
            },
            ghaza: {
                start: 'remind_ghaza'
            },
        },
        return: 'return'
    },
    equals: {
        sobh: 'صبح',
        zohr: 'ظهر',
        maghreb: 'مغرب'
    }
};

let is_active = active => {
    return (active ? 'فعال' : 'غیرفعال');
};