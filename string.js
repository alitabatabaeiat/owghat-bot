module.exports = {
    messages: {
        start: (first_name) => {
            return 'سلام ' + first_name + '!\n' + 'خوش اومدی!\n' + 'چه کاری از دستم برات برمیاد؟'
        },
        home: 'در صفحه اصلی هستی!\nچه کاری ازم برات برمیاد؟',
        specify_city: 'شهر خود را مشخص کنید',
        pray_times: (times, city) => {
            return 'اوقات شرعی امروز ' + city + ':\n\n' +
                '<b>' + 'اذان صبح: ' + '</b>' + times.fajr + '\n' +
                '<b>' + 'طلوع خورشید: ' + '</b>' + times.sunrise + '\n' +
                '<b>' + 'اذان ظهر: ' + '</b>' + times.dhuhr + '\n' +
                '<b>' + 'غروب خورشید: ' + '</b>' + times.sunset + '\n' +
                '<b>' + 'اذان مغرب: ' + '</b>' + times.maghrib + '\n' +
                '<b>' + 'نیمه شب شرعی: ' + '</b>' + times.midnight + '\n' +
                'دیگه چه کاری میتونم برات انجام بدم؟'
        },
        saved: 'اطلاعات ذخیره شد'
    },
    buttons: {
        go_home: '🏠 خانه',
        owghat: '🕌 اوقات شرعی',
        send_location: '🗺 ارسال موقعیت',
        choose_city: '🏙 انتخاب شهر',
        make_default: '💾 ذخیره اطلاعات',
        another_city: '🏙 شهر دیگر'
    },
    actions: {}
};