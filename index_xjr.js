/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* global require */
/* global __dirname */
/* global process */
var set = require('./set.js'); // 설정 파일을 읽어온다.

var Promise = require("bluebird");
var express = require('express');
var path = require('path');
var app = express();
var CORS = require('cors')();

var eventmessage = '';

app.use(CORS);

app.use(express.static(path.join(__dirname, 'html')));

app.use('/js_module', express.static(__dirname + "/js_module"));

app.use('/iconfont', express.static(__dirname + "/iconfont"));

var batcapa = 0; // 배터리 용량
var meter = {
    check_day: 0,
    grid_month_import_active_energy: 0,
    grid_month_export_active_energy: 0,
    //grid_month_import_reactive_energy: 0,
    //grid_month_export_reactive_energy: 0,
    //grid_month_total_active_energy: 0,
    //grid_month_total_reactive_energy: 0,
    grid_daily_import_active_energy: 0,
    grid_daily_export_active_energy: 0,
    //grid_daily_import_reactive_energy: 0,
    //grid_daily_export_reactive_energy: 0,
    //grid_daily_total_active_energy: 0,
    //grid_daily_total_reactive_energy: 0,
    load_month_import_active_energy: 0,
    load_month_export_active_energy: 0,
    //load_month_import_reactive_energy: 0,
    //load_month_export_reactive_energy: 0,
    //load_month_total_active_energy: 0,
    //load_month_total_reactive_energy: 0,
    load_daily_import_active_energy: 0,
    load_daily_export_active_energy: 0,
    //load_daily_import_reactive_energy: 0,
    //load_daily_export_reactive_energy: 0,
    //load_daily_total_active_energy: 0,
    //load_daily_total_reactive_energy: 0
    solar_month_energy: 0
};



//Web Server용

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('/g1', function(req, res) {
    res.sendFile(path.join(__dirname, 'gongsa1', 'gong1.html'));
});


app.get('/ess', function(req, res) {
    res.sendFile(path.join(__dirname, 'html', 'ess.html'));
});

// ESS 설치 상태 알려줌
app.get("/site_info", function(req, res) {
    var re = {
        Client_Code: set.Client_Code,
        Client_SRC: set.Client_SRC,
        ESS_Total_Capacity: set.ESS_Total_Capacity,
        ESS_Installed_date: set.ESS_Installed_date,
        MAX_Solar: set.MAX_Solar,
        MAX_Load: set.MAX_Load,
        MAX_Grid: set.MAX_Grid,
        MAX_Batt: set.MAX_Batt,
        Location_Lati: set.Location_Lati,
        Location_Longi: set.Location_Longi
    };
    res.json(re);
});


// ESS 설치 상태 알려줌
app.get("/clear_event", function(req, res) {
    clear_event();
    res.json('OK');
});

app.get("/set_event", function(req, res) {
    set_event(req.query.event);
    res.json('OK');
});
app.get("/set_event2", function(req, res) {
    if (req.query.event == 1)
        set_event("High temperature Alarm\r\n装置内のセンサーより高熱が感知され、システムを\r\n強制停止致します。\r\n装置の状態を必ず確認して下さい。", true);
    if (req.query.event == 2)
        set_event("Gas alarm\r\n装置内のセンサーよりガスが感知され、システムを\r\n強制停止致します。\r\n装置の状態を必ず確認して下さい。", true);
    if (req.query.event == 3)
        set_event("Vibration alarm\r\n装置内のセンサーより振動が感知され、システムを\r\n強制停止致します。\r\n装置の状態を必ず確認して下さい。", true);
    res.json('OK');
});


function set_event(msg) {
    eventmessage = msg;
    return 1;
}

function clear_event() {
    eventmessage = '';
    return 0;
}


// ESS 현재 상태 알려줌
app.get("/current_bms", function(req, res) {
    var re = [];
    re.push(value_bms1);
    re.push(value_bms2);
    res.json(re);
});

// ESS 현재 상태 알려줌
app.get("/current_ess", function(req, res) {
    var re = {
        // gs
        event: eventmessage,
        mode: moderun,
        Solar_input_voltage_1: 0,
        Solar_input_voltage_2: 0,
        Solar_input_current_1: 0,
        Solar_input_current_2: 0,
        Battery_voltage: 0,
        Battery_capacity: 0,
        Battery_current: 0,
        Battery_power: 0,
        //AC_input_voltage_R: 0,
        //AC_input_frequency: 0,
        //AC_output_voltage_R: 0,
        //AC_output_frequency: 0,
        Inner_temperature: 0,
        //External_battery_temperature: 0,

        //ps
        Solar_input_power1: 0,
        Solar_input_power2: 0,
        AC_output_active_power: 0,
        AC_output_total_active_power: 0,
        //AC_output_apperent_power: 0,
        //AC_output_total_apperent_power: 0,
        AC_output_power_percentage: 0,
        AC_output_connect_status: 0,
        Solar_input_1_work_status: 0,
        Solar_input_2_work_status: 0,
        Battery_power_direction: 0,
        power_direction_DCAC: 0,
        power_direction_line: 0,

        //mb grid
        pm_volt: 0,
        pm_current: 0,
        pm_active_pwr: 0,
        pm_apparent_pwr: 0,
        pm_reactive_pwr: 0,
        pm_pf: 0,
        pm_import_active_energy: 0,
        pm_export_active_energy: 0,
        //pm_import_reactive_energy: 0,
        //pm_export_reactive_energy: 0,
        //pm_total_active_energy: 0,
        //pm_total_reactive_energy: 0,


        //mb load
        ld_volt: 0,
        ld_current: 0,
        ld_active_pwr: 0,
        ld_apparent_pwr: 0,
        ld_reactive_pwr: 0,
        ld_pf: 0,
        ld_import_active_energy: 0,
        ld_export_active_energy: 0,
        //ld_import_reactive_energy: 0,
        //ld_export_reactive_energy: 0,
        //ld_total_active_energy: 0,
        //ld_total_reactive_energy: 0,

        // meter set
        check_day: meter.check_day,
        grid_month_import_active_energy: meter.grid_month_import_active_energy,
        grid_month_export_active_energy: meter.grid_month_export_active_energy,
        //grid_month_import_reactive_energy: meter.grid_month_import_reactive_energy,
        //grid_month_export_reactive_energy: meter.grid_month_export_reactive_energy,
        //grid_month_total_active_energy: meter.grid_month_total_active_energy,
        //grid_month_total_reactive_energy: meter.grid_month_total_reactive_energy,
        grid_daily_import_active_energy: meter.grid_daily_import_active_energy,
        grid_daily_export_active_energy: meter.grid_daily_export_active_energy,
        //grid_daily_import_reactive_energy: meter.grid_daily_import_reactive_energy,
        //grid_daily_export_reactive_energy: meter.grid_daily_export_reactive_energy,
        //grid_daily_total_active_energy: meter.grid_daily_total_active_energy,
        //grid_daily_total_reactive_energy: meter.grid_daily_total_reactive_energy,
        load_month_import_active_energy: meter.load_month_import_active_energy,
        load_month_export_active_energy: meter.load_month_export_active_energy,
        //load_month_import_reactive_energy: meter.load_month_import_reactive_energy,
        //load_month_export_reactive_energy: meter.load_month_export_reactive_energy,
        //load_month_total_active_energy: meter.load_month_total_active_energy,
        //load_month_total_reactive_energy: meter.load_month_total_reactive_energy,
        load_daily_import_active_energy: meter.load_daily_import_active_energy,
        load_daily_export_active_energy: meter.load_daily_export_active_energy //,
            //load_daily_import_reactive_energy: meter.load_daily_import_reactive_energy,
            //load_daily_export_reactive_energy: meter.load_daily_export_reactive_energy,
            //load_daily_total_active_energy: meter.load_daily_total_active_energy,
            //load_daily_total_reactive_energy: meter.load_daily_total_reactive_energy
    };
    if (value_gs.Alive < time_out) {
        re.Solar_input_voltage_1 = value_gs.Solar_input_voltage_1;
        re.Solar_input_voltage_2 = value_gs.Solar_input_voltage_2;
        re.Solar_input_current_1 = value_gs.Solar_input_current_1;
        re.Solar_input_current_2 = value_gs.Solar_input_current_2;
        re.Battery_voltage = value_gs.Battery_voltage;
        //re.Battery_capacity = value_gs.Battery_capacity;
        re.Battery_current = value_gs.Battery_current;
        re.Battery_power = value_gs.Battery_power;
        //re.AC_input_voltage_R = value_gs.AC_input_voltage_R;
        //re.AC_input_frequency = value_gs.AC_input_frequency;
        //re.AC_output_voltage_R = value_gs.AC_output_voltage_R;
        //re.AC_output_frequency = value_gs.AC_output_frequency;
        re.Inner_temperature = value_gs.Inner_temperature;
        //re.External_battery_temperature = value_gs.External_battery_temperature;
    }
    if (value_ps.Alive < time_out) {
        re.Solar_input_power1 = value_ps.Solar_input_power1;
        re.Solar_input_power2 = value_ps.Solar_input_power2;
        re.AC_output_active_power = value_ps.AC_output_active_power;
        re.AC_output_total_active_power = value_ps.AC_output_total_active_power;
        //re.AC_output_apperent_power = value_ps.AC_output_apperent_power;
        //re.AC_output_total_apperent_power = value_ps.AC_output_total_apperent_power;
        re.AC_output_power_percentage = value_ps.AC_output_power_percentage;
        re.AC_output_connect_status = value_ps.AC_output_connect_status;
        re.Solar_input_1_work_status = value_ps.Solar_input_1_work_status;
        re.Solar_input_2_work_status = value_ps.Solar_input_2_work_status;
        re.Battery_power_direction = value_ps.Battery_power_direction;
        re.power_direction_DCAC = value_ps.power_direction_DCAC;
        re.power_direction_line = value_ps.power_direction_line;
    }
    if (value_mb_load.Alive < time_out) {
        re.ld_volt = tof(value_mb_load.volt);
        re.ld_current = tofn(value_mb_load.current, 2);
        re.AC_output_total_active_power = tof(re.ld_active_pwr = value_mb_load.active_pwr);
        re.ld_apparent_pwr = tof(value_mb_load.apparent_pwr);
        re.ld_reactive_pwr = tof(value_mb_load.reactive_pwr);
        re.ld_pf = tofn(value_mb_load.pf, 3);
        re.ld_import_active_energy = tofn(value_mb_load_a.import_active_energy, 3);
        re.ld_export_active_energy = tofn(value_mb_load_a.export_active_energy, 3);
        //re.ld_import_reactive_energy = tofn(value_mb_load_a.import_reactive_energy, 3);
        //re.ld_export_reactive_energy = tofn(value_mb_load_a.export_reactive_energy, 3);
        //re.ld_total_active_energy = tofn(value_mb_load_a.total_active_energy, 3);
        //re.ld_total_reactive_energy = tofn(value_mb_load_a.total_reactive_energy, 3);
    }
    if (value_mb_grid.Alive < time_out) {
        re.pm_volt = tof(value_mb_grid.volt);
        re.pm_current = tofn(value_mb_grid.current, 2);
        re.pm_active_pwr = tof(value_mb_grid.active_pwr);
        re.pm_apparent_pwr = tof(value_mb_grid.apparent_pwr);
        re.pm_reactive_pwr = tof(value_mb_grid.reactive_pwr);
        re.pm_pf = tofn(value_mb_grid.pf, 3);
        re.pm_import_active_energy = tofn(value_mb_grid_a.import_active_energy, 3);
        re.pm_export_active_energy = tofn(value_mb_grid_a.export_active_energy, 3);
        //re.pm_import_reactive_energy = tofn(value_mb_grid_a.import_reactive_energy, 3);
        //re.pm_export_reactive_energy = tofn(value_mb_grid_a.export_reactive_energy, 3);
        //re.pm_total_active_energy = tofn(value_mb_grid_a.total_active_energy, 3);
        //re.pm_total_reactive_energy = tofn(value_mb_grid_a.total_reactive_energy, 3);
    }
    re.Battery_capacity = tof(get_bat_capa());
    res.json(re);
});

app.get("/current_kwhq", function(req, res) {
    if (mongoconnected) {
        if (resq.Alive < 50) {
            res.json(resq);
        } else {
            check_kwhq().then(function(databack) {
                //console.log(total);
                res.json(databack);
            });
        }
    } else {
        res.json(resq);
    }
});

app.get("/log_day2", function(req, res) {
    //console.log(req.query.date);
    var resd = {
        index: [],
        Time: [], // "2018-05-09 12:45:00",
        datetime: [], // ISODate("2018-05-09T03:45:00.032Z"),
        //Solar_input_voltage_1: [], // 0,
        //Solar_input_voltage_2: [], // 0,
        //Solar_input_current_1: [], // 0,
        //Solar_input_current_2: [], // 0,
        Solar_input_power1: [], // 0,
        Solar_input_power2: [], // 0,
        Battery_voltage: [], // 55.9,
        Battery_capacity: [], // 98,
        //Battery_current: [], // 0.329,
        Battery_power: [], // 21,
        //AC_input_voltage_R: [], // 227.1,
        //AC_input_frequency: [], // 60,
        //AC_output_voltage_R: [], // 227.1,
        //AC_output_frequency: [], // 60,
        Inner_temperature: [], // 27,
        //External_battery_temperature: [], // 0,

        //AC_output_active_power: [], // 289.1,
        //AC_output_total_active_power: [], // 287,
        //AC_output_apperent_power: [], // 719,
        //AC_output_total_apperent_power: [], // 718,
        //AC_output_power_percentage: [], // 13.9,
        //AC_output_connect_status: [], // "disconnect",
        //Solar_input_1_work_status: [], // "idle",
        //Solar_input_2_work_status: [], // "idle",
        //Battery_power_direction: [], // "charge",
        //power_direction_DCAC: [], // "AC-DC",
        //power_direction_line: [], // "input",
        //pm_volt: [], // 227.8,
        //pm_current: [], // 4.028,
        pm_active_pwr: [], // 468.3,
        //pm_apparent_pwr: [], // 624,
        //pm_reactive_pwr: [], // -230.3,
        //pm_pf: [], // 0.689,
        //pm_hz: [],
        pm_import_active_energy: [],
        pm_export_active_energy: [],
        //pm_import_reactive_energy: [],
        //pm_export_reactive_energy: [],
        //pm_total_active_energy: [],
        //pm_total_reactive_energy: [],
        //ld_volt: [], // 227.8,
        //ld_current: [], // 4.028,
        ld_active_pwr: [], // 468.3,
        //ld_apparent_pwr: [], // 624,
        //ld_reactive_pwr: [], // -230.3,
        //ld_pf: [], // 0.689,
        //ld_hz: [],
        ld_import_active_energy: [],
        ld_export_active_energy: [],
        //ld_import_reactive_energy: [],
        //ld_export_reactive_energy: [],
        //ld_total_active_energy: [],
        //ld_total_reactive_energy: [],
        check_day: 0,
        grid_month_import_active_energy: 0,
        grid_month_export_active_energy: 0,
        grid_daily_import_active_energy: 0,
        grid_daily_export_active_energy: 0,
        load_month_import_active_energy: 0,
        load_month_export_active_energy: 0,
        load_daily_import_active_energy: 0,
        load_daily_export_active_energy: 0,
    };

    if (typeof(req.query.date) == "undefined") {
        res.json(resd);
        return;
    }

    var logday = moment(req.query.date);
    console.log(moment().format('YYYY-MM-DD HH:mm:ss') + " logday requested " + logday);

    var t1 = new Date(logday.format());
    var t2 = new Date(logday.format());
    t2.setDate(t1.getDate() + 1);
    var qr = {
        "datetime": {
            $gte: new Date(t1.getFullYear(), t1.getMonth(), t1.getDate(), 0, 5),
            $lt: new Date(t2.getFullYear(), t2.getMonth(), t2.getDate(), 0, 2)
        }
    };

    mdb.collection('sum_q').find(qr).sort({ 'datetime': 1 }).toArray(function(err, result) {
        //mdb.collection('sum_h').find(qr).toArray.then(function(err, result) {
        if (err) {
            console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err);
            //res.json(err);
            return;
        }
        if (result.length > 0) {
            result.forEach(function(el, idx, arr) {
                resd.index.push(el.index);
                resd.Time.push(el.Time);
                resd.datetime.push(el.datetime);
                resd.Solar_input_power1.push(el.Solar_input_power1);
                resd.Solar_input_power2.push(el.Solar_input_power2);
                resd.Battery_voltage.push(el.Battery_voltage);
                resd.Battery_capacity.push(el.Battery_capacity);
                resd.Battery_power.push(el.Battery_power);
                resd.Inner_temperature.push(el.Inner_temperature);
                resd.pm_active_pwr.push(el.pm_active_pwr);
                resd.pm_import_active_energy.push(el.pm_import_active_energy);
                resd.pm_export_active_energy.push(el.pm_export_active_energy);
                resd.ld_active_pwr.push(el.ld_active_pwr);
                resd.ld_import_active_energy.push(el.ld_import_active_energy);
                resd.ld_export_active_energy.push(el.ld_export_active_energy);
                resd.check_day = el.check_day;
                resd.grid_month_import_active_energy = el.grid_month_import_active_energy;
                resd.grid_month_export_active_energy = el.grid_month_export_active_energy;
                resd.grid_daily_import_active_energy = el.grid_daily_import_active_energy;
                resd.grid_daily_export_active_energy = el.grid_daily_export_active_energy;
                resd.load_month_import_active_energy = el.load_month_import_active_energy;
                resd.load_month_export_active_energy = el.load_month_export_active_energy;
                resd.load_daily_import_active_energy = el.load_daily_import_active_energy;
                resd.load_daily_export_active_energy = el.load_daily_export_active_energy;


                /*
                resd.index.push(el.index);
                resd.Time.push(el.Time);
                resd.datetime.push(el.datetime);
                resd.Solar_input_voltage_1.push(el.Solar_input_voltage_1);
                resd.Solar_input_voltage_2.push(el.Solar_input_voltage_2);
                resd.Solar_input_current_1.push(el.Solar_input_current_1);
                resd.Solar_input_current_2.push(el.Solar_input_current_2);
                resd.Battery_voltage.push(el.Battery_voltage);
                resd.Battery_capacity.push(el.Battery_capacity);
                resd.Battery_current.push(el.Battery_current);
                resd.Battery_power.push(el.Battery_power);
                resd.AC_input_voltage_R.push(el.AC_input_voltage_R);
                resd.AC_input_frequency.push(el.AC_input_frequency);
                resd.AC_output_voltage_R.push(el.AC_output_voltage_R);
                resd.AC_output_frequency.push(el.AC_output_frequency);
                resd.Inner_temperature.push(el.Inner_temperature);
                resd.External_battery_temperature.push(el.External_battery_temperature);
                resd.Solar_input_power1.push(el.Solar_input_power1);
                resd.Solar_input_power2.push(el.Solar_input_power2);
                resd.AC_output_active_power.push(el.AC_output_active_power);
                resd.AC_output_total_active_power.push(el.AC_output_total_active_power);
                resd.AC_output_apperent_power.push(el.AC_output_apperent_power);
                resd.AC_output_total_apperent_power.push(el.AC_output_total_apperent_power);
                resd.AC_output_power_percentage.push(el.AC_output_power_percentage);
                resd.AC_output_connect_status.push(el.AC_output_connect_status);
                resd.Solar_input_1_work_status.push(el.Solar_input_1_work_status);
                resd.Solar_input_2_work_status.push(el.Solar_input_2_work_status);
                resd.Battery_power_direction.push(el.Battery_power_direction);
                resd.power_direction_DCAC.push(el.power_direction_DCAC);
                resd.power_direction_line.push(el.power_direction_line);
                resd.pm_volt.push(el.pm_volt);
                resd.pm_current.push(el.pm_current);
                resd.pm_active_pwr.push(el.pm_active_pwr);
                resd.pm_apparent_pwr.push(el.pm_apparent_pwr);
                resd.pm_reactive_pwr.push(el.pm_reactive_pwr);
                resd.pm_pf.push(el.pm_pf);
                resd.pm_hz.push(el.pm_hz);
                resd.pm_import_active_energy.push(el.pm_import_active_energy);
                resd.pm_export_active_energy.push(el.pm_export_active_energy);
                resd.pm_import_reactive_energy.push(el.pm_import_reactive_energy);
                resd.pm_export_reactive_energy.push(el.pm_export_reactive_energy);
                resd.pm_total_active_energy.push(el.pm_total_active_energy);
                resd.pm_total_reactive_energy.push(el.pm_total_reactive_energy);
                resd.ld_volt.push(el.ld_volt);
                resd.ld_current.push(el.ld_current);
                resd.ld_active_pwr.push(el.ld_active_pwr);
                resd.ld_apparent_pwr.push(el.ld_apparent_pwr);
                resd.ld_reactive_pwr.push(el.ld_reactive_pwr);
                resd.ld_pf.push(el.ld_pf);
                resd.ld_hz.push(el.ld_hz);
                resd.ld_import_active_energy.push(el.ld_import_active_energy);
                resd.ld_export_active_energy.push(el.ld_export_active_energy);
                resd.ld_import_reactive_energy.push(el.ld_import_reactive_energy);
                resd.ld_export_reactive_energy.push(el.ld_export_reactive_energy);
                resd.ld_total_active_energy.push(el.ld_total_active_energy);
                resd.ld_total_reactive_energy.push(el.ld_total_reactive_energy);
                */
            });
        }
        res.json(resd); // sumq에서 데이터가 조회 안된다면 
    });

});

app.get("/log_month", function(req, res) {
    var spl = req.query.date.split("_");
    console.log(moment().format('YYYY-MM-DD HH:mm:ss') + "/log_month requested/" + "0=" + spl[0] + "/1=" + spl[1]);
    var mt = Number(spl[0]) - 1;
    var yt = Number(spl[1]);
    //var mon = new Date(yt, mt, 1);
    var mon = new Date(yt, mt, meter.check_day);

    var resm = {
        Time: [], // "2018-05-09 12:45:00",
        datetime: [], // ISODate("2018-05-09T03:45:00.032Z"),
        //Solar_input_voltage_1: [], // 0,
        //Solar_input_voltage_2: [], // 0,
        //Solar_input_current_1: [], // 0,
        //Solar_input_current_2: [], // 0,
        Battery_voltage: [], // 55.9,
        Battery_capacity: [], // 98,
        //Battery_current: [], // 0.329,
        Battery_power: [], // 21,
        //AC_input_voltage_R: [], // 227.1,
        //AC_input_frequency: [], // 60,
        //AC_output_voltage_R: [], // 227.1,
        //AC_output_frequency: [], // 60,
        Inner_temperature: [], // 27,
        //External_battery_temperature: [], // 0,
        Solar_input_power1: [], // 0,
        Solar_input_power2: [], // 0,
        //AC_output_active_power: [], // 289.1,
        //AC_output_total_active_power: [], // 287,
        //AC_output_apperent_power: [], // 719,
        //AC_output_total_apperent_power: [], // 718,
        //AC_output_power_percentage: [], // 13.9,
        //AC_output_connect_status: [], // "disconnect",
        //Solar_input_1_work_status: [], // "idle",
        //Solar_input_2_work_status: [], // "idle",
        //Battery_power_direction: [], // "charge",
        //power_direction_DCAC: [], // "AC-DC",
        //power_direction_line: [], // "input",
        //pm_volt: [], // 227.8,
        //pm_current: [], // 4.028,
        pm_active_pwr: [], // 468.3,
        //pm_apparent_pwr: [], // 624,
        //pm_reactive_pwr: [], // -230.3,
        //pm_pf: [], // 0.689,
        //pm_hz: [],
        pm_import_active_energy: [],
        pm_export_active_energy: [],
        //pm_import_reactive_energy: [],
        //pm_export_reactive_energy: [],
        //pm_total_active_energy: [],
        //pm_total_reactive_energy: [],
        //ld_volt: [], // 227.8,
        //ld_current: [], // 4.028,
        ld_active_pwr: [], // 468.3,
        //ld_apparent_pwr: [], // 624,
        //ld_reactive_pwr: [], // -230.3,
        //ld_pf: [], // 0.689,
        //ld_hz: [],
        ld_import_active_energy: [],
        ld_export_active_energy: [],
        //ld_import_reactive_energy: [],
        //ld_export_reactive_energy: [],
        //ld_total_active_energy: [],
        //ld_total_reactive_energy: [],
        check_day: 0,
        grid_month_import_active_energy: [],
        grid_month_export_active_energy: [],
        load_month_import_active_energy: [],
        load_month_export_active_energy: [],
        grid_daily_import_active_energy: [],
        grid_daily_export_active_energy: [],
        load_daily_import_active_energy: [],
        load_daily_export_active_energy: [],
    };


    var logmonth = moment(mon);
    //console.log(logmonth);
    var StartTime = moment(mon);
    var EndTime = moment(mon);
    StartTime.add(-1, 'month');
    //console.log(req.query.date);

    if (typeof(logmonth) == "undefined") {
        res.json(resm);
        return;
    }

    var t1 = new Date(StartTime.format());
    var t2 = new Date(EndTime.format());
    t2.setDate(t1.getDate() + 1);
    var qr = {
        "datetime": {
            $gte: new Date(t1.getFullYear(), t1.getMonth(), t1.getDate(), 0, 5),
            $lt: new Date(t2.getFullYear(), t2.getMonth(), t2.getDate(), 0, 0)
        }
    };

    mdb.collection('sum_d').find(qr).sort({ 'datetime': 1 }).toArray(function(err, result) {
        //mdb.collection('sum_h').find(qr).toArray.then(function(err, result) {
        if (err) {
            console.log(moment().format('YYYY-MM-DD HH:mm:ss') + "/" + err);
            //res.json(err);
            return;
        }
        if (result.length > 0) {
            result.forEach(function(el, idx, arr) {
                resm.Time.push(el.Time);
                resm.datetime.push(el.datetime);
                //resm.Solar_input_voltage_1.push(el.Solar_input_voltage_1);
                //resm.Solar_input_voltage_2.push(el.Solar_input_voltage_2);
                //resm.Solar_input_current_1.push(el.Solar_input_current_1);
                //resm.Solar_input_current_2.push(el.Solar_input_current_2);
                resm.Battery_voltage.push(el.Battery_voltage);
                resm.Battery_capacity.push(el.Battery_capacity);
                //resm.Battery_current.push(el.Battery_current);
                resm.Battery_power.push(el.Battery_power);
                //resm.AC_input_voltage_R.push(el.AC_input_voltage_R);
                //resm.AC_input_frequency.push(el.AC_input_frequency);
                //resm.AC_output_voltage_R.push(el.AC_output_voltage_R);
                //resm.AC_output_frequency.push(el.AC_output_frequency);
                resm.Inner_temperature.push(el.Inner_temperature);
                //resm.External_battery_temperature.push(el.External_battery_temperature);
                resm.Solar_input_power1.push(el.Solar_input_power1);
                resm.Solar_input_power2.push(el.Solar_input_power2);
                //resm.AC_output_active_power.push(el.AC_output_active_power);
                //resm.AC_output_total_active_power.push(el.AC_output_total_active_power);
                //resm.AC_output_apperent_power.push(el.AC_output_apperent_power);
                //resm.AC_output_total_apperent_power.push(el.AC_output_total_apperent_power);
                //resm.AC_output_power_percentage.push(el.AC_output_power_percentage);
                //resm.AC_output_connect_status.push(el.AC_output_connect_status);
                //resm.Solar_input_1_work_status.push(el.Solar_input_1_work_status);
                //resm.Solar_input_2_work_status.push(el.Solar_input_2_work_status);
                //resm.Battery_power_direction.push(el.Battery_power_direction);
                //resm.power_direction_DCAC.push(el.power_direction_DCAC);
                //resm.power_direction_line.push(el.power_direction_line);
                //resm.pm_volt.push(el.pm_volt);
                //resm.pm_current.push(el.pm_current);
                resm.pm_active_pwr.push(el.pm_active_pwr);
                //resm.pm_apparent_pwr.push(el.pm_apparent_pwr);
                //resm.pm_reactive_pwr.push(el.pm_reactive_pwr);
                //resm.pm_pf.push(el.pm_pf);
                //resm.pm_hz.push(el.pm_hz);
                resm.pm_import_active_energy.push(el.pm_import_active_energy);
                resm.pm_export_active_energy.push(el.pm_export_active_energy);
                //resm.pm_import_reactive_energy.push(el.pm_import_reactive_energy);
                //resm.pm_export_reactive_energy.push(el.pm_export_reactive_energy);
                //resm.pm_total_active_energy.push(el.pm_total_active_energy);
                //resm.pm_total_reactive_energy.push(el.pm_total_reactive_energy);
                //resm.ld_volt.push(el.ld_volt);
                //resm.ld_current.push(el.ld_current);
                resm.ld_active_pwr.push(el.ld_active_pwr);
                //resm.ld_apparent_pwr.push(el.ld_apparent_pwr);
                //resm.ld_reactive_pwr.push(el.ld_reactive_pwr);
                //resm.ld_pf.push(el.ld_pf);
                //resm.ld_hz.push(el.ld_hz);
                resm.ld_import_active_energy.push(el.ld_import_active_energy);
                resm.ld_export_active_energy.push(el.ld_export_active_energy);
                //resm.ld_import_reactive_energy.push(el.ld_import_reactive_energy);
                //resm.ld_export_reactive_energy.push(el.ld_export_reactive_energy);
                //resm.ld_total_active_energy.push(el.ld_total_active_energy);
                //resm.ld_total_reactive_energy.push(el.ld_total_reactive_energy);

                resm.check_day = el.check_day;
                resm.grid_month_import_active_energy.push(el.grid_month_import_active_energy);
                resm.grid_month_export_active_energy.push(el.grid_month_export_active_energy);
                resm.load_month_import_active_energy.push(el.load_month_import_active_energy);
                resm.load_month_export_active_energy.push(el.load_month_export_active_energy);
                resm.grid_daily_import_active_energy.push(el.grid_daily_import_active_energy);
                resm.grid_daily_export_active_energy.push(el.grid_daily_export_active_energy);
                resm.load_daily_import_active_energy.push(el.load_daily_import_active_energy);
                resm.load_daily_export_active_energy.push(el.load_daily_export_active_energy);
            });
        }
        res.json(resm); // sumq에서 데이터가 조회 안된다면 
    });

    /*
    log_monthly(logmonth).then(function(total) {
        //console.log(total);
        res.json(total);
    });
    */
});


app.listen(80, function() {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss') + "/" + 'Express App on port 8080!');

});
//var mongodb = require('mongodb');
var mongodb = Promise.promisifyAll(require("mongodb"));
var MongoClient = mongodb.MongoClient;
//var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var mdb = null;

var mongoconnected = false;
MongoClient.connect(url, function(err, db) {
    if (err) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss') + "mongoconnect " + "ERROR : " + err); //throw err;
    }
    mdb = db;
    mongoconnected = true;
    console.log(moment().format('YYYY-MM-DD HH:mm:ss') + "/" + "MongoDB Connected!");
    // 배터리 잔량을 읽는다.
    mdb.collection('stat').find().toArray(function(err, result) {
        console.log(result);
        if (err) {
            console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err); //throw err;
            //res.json(rt);
        } else {
            if (result.length > 0) {
                batcapa = result[0].Bat_Capa;
                meter.check_day = result[0].check_day;
                meter.grid_month_import_active_energy = result[0].grid_month_import_active_energy;
                meter.grid_month_export_active_energy = result[0].grid_month_export_active_energy;
                //meter.grid_month_import_reactive_energy = result[0].grid_month_import_reactive_energy;
                //meter.grid_month_export_reactive_energy = result[0].grid_month_export_reactive_energy;
                //meter.grid_month_total_active_energy = result[0].grid_month_total_active_energy;
                //meter.grid_month_total_reactive_energy = result[0].grid_month_total_reactive_energy;
                meter.grid_daily_import_active_energy = result[0].grid_daily_import_active_energy;
                meter.grid_daily_export_active_energy = result[0].grid_daily_export_active_energy;
                //meter.grid_daily_import_reactive_energy = result[0].grid_daily_import_reactive_energy;
                //meter.grid_daily_export_reactive_energy = result[0].grid_daily_export_reactive_energy;
                //meter.grid_daily_total_active_energy = result[0].grid_daily_total_active_energy;
                //meter.grid_daily_total_reactive_energy = result[0].grid_daily_total_reactive_energy;
                meter.load_month_import_active_energy = result[0].load_month_import_active_energy;
                meter.load_month_export_active_energy = result[0].load_month_export_active_energy;
                //meter.load_month_import_reactive_energy = result[0].load_month_import_reactive_energy;
                //meter.load_month_export_reactive_energy = result[0].load_month_export_reactive_energy;
                //meter.load_month_total_active_energy = result[0].load_month_total_active_energy;
                //meter.load_month_total_reactive_energy = result[0].load_month_total_reactive_energy;
                meter.load_daily_import_active_energy = result[0].load_daily_import_active_energy;
                meter.load_daily_export_active_energy = result[0].load_daily_export_active_energy;
                //meter.load_daily_import_reactive_energy = result[0].load_daily_import_reactive_energy;
                //meter.load_daily_export_reactive_energy = result[0].load_daily_export_reactive_energy;
                //meter.load_daily_total_active_energy = result[0].load_daily_total_active_energy;
                //meter.load_daily_total_reactive_energy = result[0].load_daily_total_reactive_energy;
                //console.log(batcapa);
                meter.solar_month_energy = result[0].solar_month_energy;
            }
        }

    });
});

var resq = {
    index: [],
    Time: [], // "2018-05-09 12:45:00",
    datetime: [], // ISODate("2018-05-09T03:45:00.032Z"),
    //Solar_input_voltage_1: [], // 0,
    //Solar_input_voltage_2: [], // 0,
    //Solar_input_current_1: [], // 0,
    //Solar_input_current_2: [], // 0,
    Battery_voltage: [], // 55.9,
    Battery_capacity: [], // 98,
    //Battery_current: [], // 0.329,
    Battery_power: [], // 21,
    //AC_input_voltage_R: [], // 227.1,
    //AC_input_frequency: [], // 60,
    //AC_output_voltage_R: [], // 227.1,
    //AC_output_frequency: [], // 60,
    Inner_temperature: [], // 27,
    //External_battery_temperature: [], // 0,
    Solar_input_power1: [], // 0,
    Solar_input_power2: [], // 0,
    //AC_output_active_power: [], // 289.1,
    //AC_output_total_active_power: [], // 287,
    //AC_output_apperent_power: [], // 719,
    //AC_output_total_apperent_power: [], // 718,
    //AC_output_power_percentage: [], // 13.9,
    //AC_output_connect_status: [], // "disconnect",
    //Solar_input_1_work_status: [], // "idle",
    //Solar_input_2_work_status: [], // "idle",
    //Battery_power_direction: [], // "charge",
    //power_direction_DCAC: [], // "AC-DC",
    //power_direction_line: [], // "input",
    //pm_volt: [], // 227.8,
    //pm_current: [], // 4.028,
    pm_active_pwr: [], // 468.3,
    //pm_apparent_pwr: [], // 624,
    //pm_reactive_pwr: [], // -230.3,
    pm_pf: [], // 0.689,
    //ld_volt: [],
    //ld_current: [],
    ld_active_pwr: [],
    //ld_apparent_pwr: [],
    //ld_reactive_pwr: [],
    ld_pf: [],
    solar_month_energy: 0,
    Alive: 999
};

function check_kwhq() {
    return new Promise(function(resolve, reject) {
        var t1 = new Date();
        var t2 = new Date();
        t2.setDate(t1.getDate() + 1);
        resq = {
            index: [],
            Time: [], // "2018-05-09 12:45:00",
            datetime: [], // ISODate("2018-05-09T03:45:00.032Z"),
            //Solar_input_voltage_1: [], // 0,
            //Solar_input_voltage_2: [], // 0,
            //Solar_input_current_1: [], // 0,
            //Solar_input_current_2: [], // 0,
            Solar_input_power1: [], // 0,
            Solar_input_power2: [], // 0,
            Battery_voltage: [], // 55.9,
            Battery_capacity: [], // 98,
            //Battery_current: [], // 0.329,
            Battery_power: [], // 21,
            //AC_input_voltage_R: [], // 227.1,
            //AC_input_frequency: [], // 60,
            //AC_output_voltage_R: [], // 227.1,
            //AC_output_frequency: [], // 60,
            Inner_temperature: [], // 27,
            //External_battery_temperature: [], // 0,
            //AC_output_active_power: [], // 289.1,
            //AC_output_total_active_power: [], // 287,
            //AC_output_apperent_power: [], // 719,
            //AC_output_total_apperent_power: [], // 718,
            //AC_output_power_percentage: [], // 13.9,
            //AC_output_connect_status: [], // "disconnect",
            //Solar_input_1_work_status: [], // "idle",
            //Solar_input_2_work_status: [], // "idle",
            //Battery_power_direction: [], // "charge",
            //power_direction_DCAC: [], // "AC-DC",
            //power_direction_line: [], // "input",
            //pm_volt: [], // 227.8,
            //pm_current: [], // 4.028,
            pm_active_pwr: [], // 468.3,
            //pm_apparent_pwr: [], // 624,
            //pm_reactive_pwr: [], // -230.3,
            pm_pf: [], // 0.689,
            //ld_volt: [],
            //ld_current: [],
            ld_active_pwr: [],
            //ld_apparent_pwr: [],
            //ld_reactive_pwr: [],
            ld_pf: [],
            check_day: meter.check_day,
            grid_month_import_active_energy: meter.grid_month_import_active_energy,
            grid_month_export_active_energy: meter.grid_month_export_active_energy,
            grid_daily_import_active_energy: meter.grid_daily_import_active_energy,
            grid_daily_export_active_energy: meter.grid_daily_export_active_energy,
            load_month_import_active_energy: meter.load_month_import_active_energy,
            load_month_export_active_energy: meter.load_month_export_active_energy,
            load_daily_import_active_energy: meter.load_daily_import_active_energy,
            load_daily_export_active_energy: meter.load_daily_export_active_energy,
            Alive: 0
        };

        // 오늘 00시부터 현재 시간까지 시간별 Kwh데이터를 쿼리한다.
        var qr = {
            "datetime": {
                $gte: new Date(t1.getFullYear(), t1.getMonth(), t1.getDate(), 0, 0),
                $lt: new Date(t2.getFullYear(), t2.getMonth(), t2.getDate(), 0, 1)
                    //$gte: new Date(t1.getFullYear(), t1.getMonth(), t1.getDate(), 22, 0),
                    //$lt: new Date(t1.getFullYear(), t1.getMonth(), t1.getDate(), 23, 0),
            }
        };
        //console.log(qr);
        mdb.collection('sum_q').find(qr).sort({ 'datetime': 1 }).toArray(function(err, result) {
            //mdb.collection('sum_h').find(qr).toArray.then(function(err, result) {
            if (err) console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "checkkwhq error " + err); //throw err;
            else {
                if (result.length > 0) {
                    //console.log("check_kwhq 시간별 조회");
                    //console.log("sum_q에서" + result.length + "개가 조회됨");
                    result.forEach(function(el, idx, arr) {
                        //console.log(result);
                        resq.index.push(el.index);
                        resq.Time.push(el.Time);
                        resq.datetime.push(el.datetime);
                        //resq.Solar_input_voltage_1.push(el.Solar_input_voltage_1);
                        //resq.Solar_input_voltage_2.push(el.Solar_input_voltage_2);
                        //resq.Solar_input_current_1.push(el.Solar_input_current_1);
                        //resq.Solar_input_current_2.push(el.Solar_input_current_2);
                        resq.Solar_input_power1.push(el.Solar_input_power1);
                        resq.Solar_input_power2.push(el.Solar_input_power2);
                        resq.Battery_voltage.push(el.Battery_voltage);
                        resq.Battery_capacity.push(el.Battery_capacity);
                        //resq.Battery_current.push(el.Battery_current);
                        resq.Battery_power.push(el.Battery_power);
                        //resq.AC_input_voltage_R.push(el.AC_input_voltage_R);
                        //resq.AC_input_frequency.push(el.AC_input_frequency);
                        //resq.AC_output_voltage_R.push(el.AC_output_voltage_R);
                        //resq.AC_output_frequency.push(el.AC_output_frequency);
                        resq.Inner_temperature.push(el.Inner_temperature);
                        //resq.External_battery_temperature.push(el.External_battery_temperature);

                        //resq.AC_output_active_power.push(el.AC_output_active_power);
                        //resq.AC_output_total_active_power.push(el.AC_output_total_active_power);
                        //resq.AC_output_apperent_power.push(el.AC_output_apperent_power);
                        //resq.AC_output_total_apperent_power.push(el.AC_output_total_apperent_power);
                        //resq.AC_output_power_percentage.push(el.AC_output_power_percentage);
                        //resq.AC_output_connect_status.push(el.AC_output_connect_status);
                        //resq.Solar_input_1_work_status.push(el.Solar_input_1_work_status);
                        //resq.Solar_input_2_work_status.push(el.Solar_input_2_work_status);
                        //resq.Battery_power_direction.push(el.Battery_power_direction);
                        //resq.power_direction_DCAC.push(el.power_direction_DCAC);
                        //resq.power_direction_line.push(el.power_direction_line);
                        //resq.pm_volt.push(el.pm_volt);
                        //resq.pm_current.push(el.pm_current);
                        resq.pm_active_pwr.push(el.pm_active_pwr);
                        //resq.pm_apparent_pwr.push(el.pm_apparent_pwr);
                        //resq.pm_reactive_pwr.push(el.pm_reactive_pwr);
                        resq.pm_pf.push(el.pm_pf);
                        //resq.ld_volt.push(el.ld_volt);
                        //resq.ld_current.push(el.ld_current);
                        resq.ld_active_pwr.push(el.ld_active_pwr);
                        //resq.ld_apparent_pwr.push(el.ld_apparent_pwr);
                        //resq.ld_reactive_pwr.push(el.ld_reactive_pwr);
                        resq.ld_pf.push(el.ld_pf);
                    });
                }
                var qt = {
                    index: 0,
                    Time: 0,
                    datetime: 0,

                    // optisolar GS
                    //Solar_input_voltage_1: 0,
                    //Solar_input_voltage_2: 0,
                    //Solar_input_current_1: 0,
                    //Solar_input_current_2: 0,
                    Battery_voltage: 0,
                    Battery_capacity: 0,
                    //Battery_current: 0,
                    Battery_power: 0,
                    //AC_input_voltage_R: 0,
                    //AC_input_frequency: 0,
                    //AC_output_voltage_R: 0,
                    //AC_output_frequency: 0,10
                    Inner_temperature: 0,
                    //External_battery_temperature: 0,

                    //optisolar ps
                    Solar_input_power1: 0,
                    Solar_input_power2: 0,
                    //AC_output_active_power: 0,
                    //AC_output_total_active_power: 0,
                    //AC_output_apperent_power: 0,
                    //AC_output_total_apperent_power: 0,
                    //AC_output_power_percentage: 0,
                    //AC_output_connect_status: 0,
                    //Solar_input_1_work_status: 0,
                    //Solar_input_2_work_status: 0,
                    //Battery_power_direction: 0,
                    //power_direction_DCAC: 0,
                    //power_direction_line: 0,

                    // modbus powermeter
                    //pm_volt: 0,
                    //pm_current: 0,
                    pm_active_pwr: 0,
                    //pm_apparent_pwr: 0,
                    //pm_reactive_pwr: 0,
                    pm_pf: 0,

                    //ld_volt: 0,
                    //ld_current: 0,
                    ld_active_pwr: 0,
                    //ld_apparent_pwr: 0,
                    //ld_reactive_pwr: 0,
                    ld_pf: 0
                };

                var d = new Date();
                resq.index.push(Number(d.getHours() * 60 + d.getMinutes()));
                var t1 = moment();
                resq.Time.push(t1.format('YYYY-MM-DD HH:mm:ss'));
                resq.datetime.push(new Date(t1.toISOString()));

                if (value_gs_a.Alive < time_out && value_gs_a.Solar_input_voltage_1.length > 0) {
                    //qt.Solar_input_voltage_1 = value_gs_q.Solar_input_voltage_1 = tof(value_gs_a.Solar_input_voltage_1.average());
                    //qt.Solar_input_voltage_2 = value_gs_q.Solar_input_voltage_2 = tof(value_gs_a.Solar_input_voltage_2.average());
                    //qt.Solar_input_current_1 = value_gs_q.Solar_input_current_1 = tof(value_gs_a.Solar_input_current_1.average());
                    //qt.Solar_input_current_2 = value_gs_q.Solar_input_current_2 = tof(value_gs_a.Solar_input_current_2.average());
                    //qt.Battery_voltage = value_gs_q.Battery_voltage = tof(value_gs_a.Battery_voltage.average());
                    qt.Battery_voltage = value_gs_q.Battery_voltage = tof(value_gs.Battery_voltage);
                    qt.Battery_capacity = value_gs_q.Battery_capacity = tof(get_bat_capa());
                    //qt.Battery_current = value_gs_q.Battery_current = tofn(value_gs_a.Battery_current.average(), 3);
                    //qt.Battery_power = value_gs_q.Battery_power = tof(value_gs_a.Battery_power.average() * ( ((d.getMinutes() * 60 + d.getSeconds())%900) / 900 ) );
                    qt.Battery_power = value_gs_q.Battery_power = tof(value_gs_a.Battery_power.average());
                    //qt.AC_input_voltage_R = value_gs_q.AC_input_voltage_R = tof(value_gs_a.AC_input_voltage_R.average());
                    //qt.AC_input_frequency = value_gs_q.AC_input_frequency = tof(value_gs_a.AC_input_frequency.average());
                    //qt.AC_output_voltage_R = value_gs_q.AC_output_voltage_R = tof(value_gs_a.AC_output_voltage_R.average());
                    //qt.AC_output_frequency = value_gs_q.AC_output_frequency = tof(value_gs_a.AC_output_frequency.average());
                    qt.Inner_temperature = value_gs_q.Inner_temperature = tof(value_gs_a.Inner_temperature.average());
                    //qt.External_battery_temperature = value_gs_q.External_battery_temperature = tof(value_gs_a.External_battery_temperature.average());
                }

                if (value_ps_a.Alive < time_out && value_ps_a.Solar_input_power1.length > 0) {
                    qt.Solar_input_power1 = value_ps_q.Solar_input_power1 = tof(value_ps_a.Solar_input_power1.average());
                    qt.Solar_input_power2 = value_ps_q.Solar_input_power2 = tof(value_ps_a.Solar_input_power2.average());
                    //qt.AC_output_active_power = value_ps_q.AC_output_active_power = tof(value_ps_a.AC_output_active_power.average());
                    //qt.AC_output_total_active_power = value_ps_q.AC_output_total_active_power = tof(value_ps_a.AC_output_total_active_power.average());
                    //qt.AC_output_apperent_power = value_ps_q.AC_output_apperent_power = tof(value_ps_a.AC_output_apperent_power.average());
                    //qt.AC_output_total_apperent_power = value_ps_q.AC_output_total_apperent_power = tof(value_ps_a.AC_output_total_apperent_power.average());
                    //qt.AC_output_power_percentage = value_ps_q.AC_output_power_percentage = tof(value_ps_a.AC_output_power_percentage.average());
                    //qt.AC_output_connect_status = value_ps_q.AC_output_connect_status = value_ps_a.AC_output_connect_status;
                    //qt.Solar_input_1_work_status = value_ps_q.Solar_input_1_work_status = value_ps_a.Solar_input_1_work_status;
                    //qt.Solar_input_2_work_status = value_ps_q.Solar_input_2_work_status = value_ps_a.Solar_input_2_work_status;
                    //qt.Battery_power_direction = value_ps_q.Battery_power_direction = value_ps_a.Battery_power_direction;
                    //qt.power_direction_DCAC = value_ps_q.power_direction_DCAC = value_ps_a.power_direction_DCAC;
                    //qt.power_direction_line = value_ps_q.power_direction_line = value_ps_a.power_direction_line;
                }

                if (value_mb_grid_a.Alive < time_out && value_mb_grid_a.volt.length > 0) {
                    //qt.pm_volt = tof(value_mb_grid_a.volt.average());
                    //qt.pm_current = tofn(value_mb_grid_a.current.average(), 3);
                    //qt.pm_active_pwr = tof(value_mb_a.active_pwr.average() * ( ((d.getMinutes() * 60 + d.getSeconds())%900) / 900 ));
                    qt.pm_active_pwr = tof(value_mb_grid_a.active_pwr.average());
                    //qt.pm_apparent_pwr = tof(value_mb_a.apparent_pwr.average() * ( ((d.getMinutes() * 60 + d.getSeconds())%900) / 900 ));
                    //qt.pm_apparent_pwr = tof(value_mb_grid_a.apparent_pwr.average());
                    //qt.pm_reactive_pwr = tof(value_mb_a.reactive_pwr.average() * ( ((d.getMinutes() * 60 + d.getSeconds())%900) / 900 ));
                    //qt.pm_reactive_pwr = tof(value_mb_grid_a.reactive_pwr.average());
                    qt.pm_pf = tofn(value_mb_grid_a.pf.average(), 3);
                }

                if (value_mb_load_a.Alive < time_out && value_mb_load_a.volt.length > 0) {
                    //qt.ld_volt = tof(value_mb_load_a.volt.average());
                    //qt.ld_current = tofn(value_mb_load_a.current.average(), 3);
                    qt.ld_active_pwr = tof(value_mb_load_a.active_pwr.average());
                    //qt.ld_apparent_pwr = tof(value_mb_load_a.apparent_pwr.average());
                    //qt.ld_reactive_pwr = tof(value_mb_load_a.reactive_pwr.average());
                    qt.ld_pf = tofn(value_mb_load_a.pf.average(), 3);
                }

                //resq.Solar_input_voltage_1.push(qt.Solar_input_voltage_1);
                //resq.Solar_input_voltage_2.push(qt.Solar_input_voltage_2);
                //resq.Solar_input_current_1.push(qt.Solar_input_current_1);
                //resq.Solar_input_current_2.push(qt.Solar_input_current_2);
                resq.Battery_voltage.push(qt.Battery_voltage);
                resq.Battery_capacity.push(qt.Battery_capacity);
                //resq.Battery_current.push(qt.Battery_current);
                resq.Battery_power.push(qt.Battery_power);
                //resq.AC_input_voltage_R.push(qt.AC_input_voltage_R);
                //resq.AC_input_frequency.push(qt.AC_input_frequency);
                //resq.AC_output_voltage_R.push(qt.AC_output_voltage_R);
                //resq.AC_output_frequency.push(qt.AC_output_frequency);
                resq.Inner_temperature.push(qt.Inner_temperature);
                //resq.External_battery_temperature.push(qt.External_battery_temperature);
                resq.Solar_input_power1.push(qt.Solar_input_power1);
                resq.Solar_input_power2.push(qt.Solar_input_power2);
                //resq.AC_output_active_power.push(qt.AC_output_active_power);
                //resq.AC_output_total_active_power.push(qt.AC_output_total_active_power);
                //resq.AC_output_apperent_power.push(qt.AC_output_apperent_power);
                //resq.AC_output_total_apperent_power.push(qt.AC_output_total_apperent_power);
                //resq.AC_output_power_percentage.push(qt.AC_output_power_percentage);
                //resq.AC_output_connect_status.push(qt.AC_output_connect_status);
                //resq.Solar_input_1_work_status.push(qt.Solar_input_1_work_status);
                //resq.Solar_input_2_work_status.push(qt.Solar_input_2_work_status);
                //resq.Battery_power_direction.push(qt.Battery_power_direction);
                //resq.power_direction_DCAC.push(qt.power_direction_DCAC);
                //resq.power_direction_line.push(qt.power_direction_line);
                //resq.pm_volt.push(qt.pm_volt);
                //resq.pm_current.push(qt.pm_current);
                resq.pm_active_pwr.push(qt.pm_active_pwr);
                //resq.pm_apparent_pwr.push(qt.pm_apparent_pwr);
                //resq.pm_reactive_pwr.push(qt.pm_reactive_pwr);
                resq.pm_pf.push(qt.pm_pf);
                //resq.ld_volt.push(qt.ld_volt);
                //resq.ld_current.push(qt.ld_current);
                resq.ld_active_pwr.push(qt.ld_active_pwr);
                //resq.ld_apparent_pwr.push(qt.ld_apparent_pwr);
                //resq.ld_reactive_pwr.push(qt.ld_reactive_pwr);
                resq.ld_pf.push(qt.ld_pf);
                resq.solar_month_energy = tof(meter.solar_month_energy + (resq.Solar_input_power1.sum() + resq.Solar_input_power2.sum()) / 4000);

                resolve(resq);
            }
        });

    });
}

var crc = require('crc'); // crc16 xmodem 계산용
var moment = require('moment'); //moment

process.on('uncaughtException', function(err) {
    console.error(moment().format('YYYY-MM-DD HH:mm:ss / ') + "uncaughtException error \n" + err.stack);
    console.log("Node NOT Exiting...");
});

var SerialPort = require('serialport');
var port = new SerialPort(set.port_opti, {
    baudRate: 2400
});

// Open errors will be emitted as an error event 
port.on('error', function(err) {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "port " + 'Error: ', err.message);
});

port.on('data', function(data) {
    //console.log(data);
    data.forEach(function(el, idx, arr) {
        func_opti_rcv(el);
    });
});

var port_bat1 = new SerialPort(set.port_batt1, {
    baudRate: 9600
});
var port_bat2 = new SerialPort(set.port_batt2, {
    baudRate: 9600
});

// Open errors will be emitted as an error event 
port_bat1.on('error', function(err) {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "port_bat1 " + 'Error: ', err.message);
});
// Open errors will be emitted as an error event 
port_bat2.on('error', function(err) {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "port_bat2 " + 'Error: ', err.message);
});

port_bat1.on('data', function(data) {
    //console.log(data);
    data.forEach(function(el, idx, arr) {
        //console.log(btoh(el));
        //process.stdout.write(btoh(el));
        func_bms1_rcv(el);
    });
});

port_bat2.on('data', function(data) {
    //console.log(data);

    data.forEach(function(el, idx, arr) {
        //process.stdout.write(btoh(el));
        func_bms2_rcv(el);
    });
});

var value_bms1 = {
    current: 0,
    total_voltage: 0,
    cell_volt: [],
    Balanced_state: 0,
    Balanced_state_msg: [],
    Protection_state: 0,
    Protection_state_msg: [],
    MOSFET_Charge: 0,
    MOSFET_Discharge: 0,
    RSOC: 0,
    NTC_quantity: 0,
    NTC_content: [],
    Residual_capacity: 0,
    Nominal_capacity: 0,
    Cycle_times: 0,
    Battery_serial: 0,
    Date_of_manufacture: 0,
    BMS_Software_version: 0,
    Alive: 999
};
var value_bms2 = {
    current: 0,
    total_voltage: 0,
    cell_volt: [],
    Balanced_state: 0,
    Balanced_state_msg: [],
    Protection_state: 0,
    Protection_state_msg: [],
    MOSFET_Charge: 0,
    MOSFET_Discharge: 0,
    RSOC: 0,
    NTC_quantity: 0,
    NTC_content: [],
    Residual_capacity: 0,
    Nominal_capacity: 0,
    Cycle_times: 0,
    Battery_serial: 0,
    Date_of_manufacture: 0,
    BMS_Software_version: 0,
    Alive: 999
};


// Battery bms 데이터 수신용 변수들
var bms1_accu = []; // 데이터 수신 및 누적하는 함수
var bms1_stage = 0; // 데이터 수신 스테이지
var bms1_rcv_count = 0; // 데이터 실제 수신 갯수
var bms1_length; // 데이터 길이
var bms1_command = 0;
var bms1_crc1 = null; // CRC1
var bms1_crc2 = null;

function func_bms1_rcv(rcv) {
    //    HD CM LH LL 
    //3번 DD 03 00 1F 14 B1 FD 4C 46 51 4E 20 00 01 26 54 00 00 00 00 00 00 20 5A 03 10 04 0B 14 0B 35 0B 80 0B 61 FA 6C 77
    //4번 DD 04 00 20 0C F2 0C F4 0C F1 0C F0 0C F1 0C F1 0C F1 0C EE 0C EC 0C E7 0C EE 0C F1 0C EF 0C F2 0C F5 0C E7 F0 29 77
    //console.log(btoh(rcv));

    //rcv_char = String.fromCharCode(rcv);
    // stage 0 : waiting Header 0xdd
    if (bms1_stage == 0 && rcv == 0xdd) {
        bms1_stage = 1;
        bms1_accu = [];
        bms1_length = 0;
        bms1_rcv_count = 0;
        bms1_crc1 = null;
        bms1_crc2 = null;
        //console.log("0!");
    }
    // stage 1 : wating data command
    else if (bms1_stage == 1) {
        //batt1_accu.push(rcv);
        bms1_command = rcv;
        bms1_stage = 2;
        //console.log("2!");
    }
    // stage 2 : wating data unknown (high bit of length?)
    else if (bms1_stage == 2) {
        bms1_accu.push(rcv);
        bms1_stage = 3;
        //console.log("2!");
    }
    // stage 3 : wating data length
    else if (bms1_stage == 3) {
        bms1_length = rcv;
        bms1_accu.push(rcv);
        bms1_stage = 4;
        //console.log("3!");
    }
    // stage 4 : waiting data and finish by crc1
    else if (bms1_stage == 4) {
        //console.log("4!");
        if (bms1_rcv_count < bms1_length) {
            bms1_rcv_count++;
            bms1_accu.push(rcv);
        } else {
            bms1_stage = 5;
            bms1_crc1 = rcv;
        }
    }
    // stage 5 : waiting crc2
    else if (bms1_stage == 5) {
        //console.log("5!");
        //batt1_accu.push(rcv);
        bms1_crc2 = rcv;
        bms1_stage = 6;
    } else if (bms1_stage == 6 && rcv == 0x77) {
        //console.log("6!");
        var i = 0;
        var ac = 0;
        var calcresult = 0;
        //cmd code에서 데이터까지 다 더한 값을 FFFF에 빼고, 1을 더한다. 
        for (; i < bms1_accu.length; i++) {
            ac += bms1_accu[i];
        }
        calcresult = 0xffff - ac + 1;

        var crcresult = bms1_crc1 * 256 + bms1_crc2;
        if (crcresult == calcresult) {
            //console.log("@@from:" + batt1_from.toString(16) + "/to:" + batt1_to.toString(16));
            bms1_parser(bms1_accu, bms1_command);
        } else {
            console.log('\r\n' + crcresult + '/' + calcresult);
            console.log("batt1 crc error");
        }
        bms1_accu = [];
        bms1_stage = 0;
    } else {
        console.log("batt1 " + bms1_stage + "!?");
        bms1_stage = 0;
        bms1_accu = [];
    }
}

function bms1_parser(batt1_accu, batt1_command) {
    //console.log("batt1 /" + batt1_command);
    if (batt1_command == 3) {
        let tmp;
        tmp = bb(batt1_accu, 1);
        value_bms1.total_voltage = tofn(sint(tmp) * 0.01, 2);
        tmp = bb(batt1_accu, 2);
        value_bms1.current = tofn(sint(tmp) * 0.01, 2);
        tmp = bb(batt1_accu, 3);
        value_bms1.Residual_capacity = tofn(sint(tmp) * 0.01, 2);
        tmp = bb(batt1_accu, 4);
        value_bms1.Nominal_capacity = tofn(sint(tmp) * 0.01, 2);
        tmp = bb(batt1_accu, 5);
        value_bms1.Cycle_times = tofn(sint(tmp));
        tmp = bb(batt1_accu, 6);
        value_bms1.Date_of_manufacture = (2000 + (tmp >> 9)).toString() + "-" + ((tmp >> 5) & 0x0f).toString() + "-" + (tmp & 0x1f).toString();
        value_bms1.Balanced_state = (bb(batt1_accu, 8) * 256) + bb(batt1_accu, 7);
        value_bms1.Balanced_state_msg = [];
        if ((value_bms1.Balanced_state & 0x01) == 0x01) value_bms1.Balanced_state_msg.push("1");
        if ((value_bms1.Balanced_state & 0x02) == 0x02) value_bms1.Balanced_state_msg.push("2");
        if ((value_bms1.Balanced_state & 0x04) == 0x04) value_bms1.Balanced_state_msg.push("3");
        if ((value_bms1.Balanced_state & 0x08) == 0x08) value_bms1.Balanced_state_msg.push("4");
        if ((value_bms1.Balanced_state & 0x10) == 0x10) value_bms1.Balanced_state_msg.push("5");
        if ((value_bms1.Balanced_state & 0x20) == 0x20) value_bms1.Balanced_state_msg.push("6");
        if ((value_bms1.Balanced_state & 0x40) == 0x40) value_bms1.Balanced_state_msg.push("7");
        if ((value_bms1.Balanced_state & 0x80) == 0x80) value_bms1.Balanced_state_msg.push("8");
        if ((value_bms1.Balanced_state & 0x100) == 0x100) value_bms1.Balanced_state_msg.push("9");
        if ((value_bms1.Balanced_state & 0x200) == 0x200) value_bms1.Balanced_state_msg.push("10");
        if ((value_bms1.Balanced_state & 0x400) == 0x400) value_bms1.Balanced_state_msg.push("11");
        if ((value_bms1.Balanced_state & 0x800) == 0x800) value_bms1.Balanced_state_msg.push("12");
        if ((value_bms1.Balanced_state & 0x1000) == 0x1000) value_bms1.Balanced_state_msg.push("13");
        if ((value_bms1.Balanced_state & 0x2000) == 0x2000) value_bms1.Balanced_state_msg.push("14");
        if ((value_bms1.Balanced_state & 0x4000) == 0x4000) value_bms1.Balanced_state_msg.push("15");
        if ((value_bms1.Balanced_state & 0x8000) == 0x8000) value_bms1.Balanced_state_msg.push("16");
        value_bms1.Balanced_state = value_bms1.Balanced_state.toString(2);

        tmp = bb(batt1_accu, 9);
        value_bms1.Protection_state = tmp;
        value_bms1.Protection_state_msg = [];
        if ((value_bms1.Protection_state & 0x01) == 0x01) value_bms1.Protection_state_msg.push("Single overvoltage protection");
        if ((value_bms1.Protection_state & 0x02) == 0x02) value_bms1.Protection_state_msg.push("Single undervoltage protection");
        if ((value_bms1.Protection_state & 0x04) == 0x04) value_bms1.Protection_state_msg.push("Whole group overvoltage protection");
        if ((value_bms1.Protection_state & 0x08) == 0x08) value_bms1.Protection_state_msg.push("Whole group undervoltage protection");
        if ((value_bms1.Protection_state & 0x10) == 0x10) value_bms1.Protection_state_msg.push("(Charge) over temperature protection");
        if ((value_bms1.Protection_state & 0x20) == 0x20) value_bms1.Protection_state_msg.push("(Charge) under temperature protection");
        if ((value_bms1.Protection_state & 0x40) == 0x40) value_bms1.Protection_state_msg.push("(discharge) over temperature protection");
        if ((value_bms1.Protection_state & 0x80) == 0x80) value_bms1.Protection_state_msg.push("(discharge) under temperature protection");
        if ((value_bms1.Protection_state & 0x100) == 0x100) value_bms1.Protection_state_msg.push("(charge) over current protect");
        if ((value_bms1.Protection_state & 0x200) == 0x200) value_bms1.Protection_state_msg.push("(discharge) over current protect");
        if ((value_bms1.Protection_state & 0x400) == 0x400) value_bms1.Protection_state_msg.push("short protect");
        if ((value_bms1.Protection_state & 0x800) == 0x800) value_bms1.Protection_state_msg.push("Front detection IC error");
        if ((value_bms1.Protection_state & 0x1000) == 0x1000) value_bms1.Protection_state_msg.push("Software lock MOS");
        value_bms1.Protection_state = tmp.toString(2);
        value_bms1.BMS_Software_version = batt1_accu[20];
        value_bms1.RSOC = batt1_accu[21];
        if (batt1_accu[22] & 1 == 1) value_bms1.MOSFET_Charge = 1;
        else value_bms1.MOSFET_Charge = 0;
        if (batt1_accu[22] & 10 == 10) value_bms1.MOSFET_Discharge = 1;
        else value_bms1.MOSFET_Discharge = 0;
        value_bms1.Battery_serial = batt1_accu[23];
        value_bms1.NTC_quantity = batt1_accu[24];
        value_bms1.NTC_content = [];

        for (let i = 0; i < value_bms1.NTC_quantity * 2; i += 2) {
            let tt = ((batt1_accu[25 + i] * 256) + batt1_accu[26 + i]);
            tt = tt - 2731;
            value_bms1.NTC_content.push(tof(tt * 0.1));
        }
        value_bms1.Alive = 0;
    } else if (batt1_command == 4) {
        value_bms1.cell_volt = [];
        for (let i = 1; i <= value_bms1.Battery_serial; i++) {
            let tt = bb(batt1_accu, i);
            value_bms1.cell_volt.push(tofn(tt / 1000, 3));
        }
        value_bms1.Alive = 0;
        //console.log(val_bat1);
    }
}


// bms2 데이터 수신용 변수들
var bms2_accu = []; // 데이터 수신 및 누적하는 함수
var bms2_stage = 0; // 데이터 수신 스테이지
var bms2_rcv_count = 0; // 데이터 실제 수신 갯수
var bms2_length; // 데이터 길이
var bms2_command = 0;
var bms2_crc1 = null; // CRC1
var bms2_crc2 = null;

function func_bms2_rcv(rcv) {
    //    HD CM LH LL 
    //3번 DD 03 00 1F 14 B1 FD 4C 46 51 4E 20 00 01 26 54 00 00 00 00 00 00 20 5A 03 10 04 0B 14 0B 35 0B 80 0B 61 FA 6C 77
    //4번 DD 04 00 20 0C F2 0C F4 0C F1 0C F0 0C F1 0C F1 0C F1 0C EE 0C EC 0C E7 0C EE 0C F1 0C EF 0C F2 0C F5 0C E7 F0 29 77
    //console.log(btoh(rcv));

    //rcv_char = String.fromCharCode(rcv);
    // stage 0 : waiting Header 0xdd
    if (bms2_stage == 0 && rcv == 0xdd) {
        bms2_stage = 1;
        bms2_accu = [];
        bms2_length = 0;
        bms2_rcv_count = 0;
        bms2_crc1 = null;
        bms2_crc2 = null;
        //console.log("0!");
    }
    // stage 1 : wating data command
    else if (bms2_stage == 1) {
        //batt2_accu.push(rcv);
        bms2_command = rcv;
        bms2_stage = 2;
        //console.log("2!");
    }
    // stage 2 : wating data unknown (high bit of length?)
    else if (bms2_stage == 2) {
        bms2_accu.push(rcv);
        bms2_stage = 3;
        //console.log("2!");
    }
    // stage 3 : wating data length
    else if (bms2_stage == 3) {
        bms2_length = rcv;
        bms2_accu.push(rcv);
        bms2_stage = 4;
        //console.log("3!");
    }
    // stage 4 : waiting data and finish by crc1
    else if (bms2_stage == 4) {
        //console.log("4!");
        if (bms2_rcv_count < bms2_length) {
            bms2_rcv_count++;
            bms2_accu.push(rcv);
        } else {
            bms2_stage = 5;
            bms2_crc1 = rcv;
        }
    }
    // stage 5 : waiting crc2
    else if (bms2_stage == 5) {
        //console.log("5!");
        //batt2_accu.push(rcv);
        bms2_crc2 = rcv;
        bms2_stage = 6;
    } else if (bms2_stage == 6 && rcv == 0x77) {
        //console.log("6!");
        var i = 0;
        var ac = 0;
        var calcresult = 0;
        //cmd code에서 데이터까지 다 더한 값을 FFFF에 빼고, 1을 더한다. 
        for (; i < bms2_accu.length; i++) {
            ac += bms2_accu[i];
        }
        calcresult = 0xffff - ac + 1;

        var crcresult = bms2_crc1 * 256 + bms2_crc2;
        if (crcresult == calcresult) {
            //console.log("@@from:" + batt2_from.toString(16) + "/to:" + batt2_to.toString(16));
            bms2_parser(bms2_accu, bms2_command);
        } else {
            console.log('\r\n' + crcresult + '/' + calcresult);
            console.log("batt2 crc error");
        }
        bms2_accu = [];
        bms2_stage = 0;
    } else {
        console.log("batt2 " + bms2_stage + "!?");
        bms2_stage = 0;
        bms2_accu = [];
    }
}

function bms2_parser(batt2_accu, batt2_command) {
    //console.log("batt2 /" + batt2_command);
    //console.log(batt2_accu);
    if (batt2_command == 3) {
        let tmp;
        tmp = bb(batt2_accu, 1);
        value_bms2.total_voltage = tofn(sint(tmp) * 0.01, 2);
        tmp = bb(batt2_accu, 2);
        value_bms2.current = tofn(sint(tmp) * 0.01, 2);
        tmp = bb(batt2_accu, 3);
        value_bms2.Residual_capacity = tofn(sint(tmp) * 0.01, 2);
        tmp = bb(batt2_accu, 4);
        value_bms2.Nominal_capacity = tofn(sint(tmp) * 0.01, 2);
        tmp = bb(batt2_accu, 5);
        value_bms2.Cycle_times = tofn(sint(tmp));
        tmp = bb(batt2_accu, 6);
        value_bms2.Date_of_manufacture = (2000 + (tmp >> 9)).toString() + "-" + ((tmp >> 5) & 0x0f).toString() + "-" + (tmp & 0x1f).toString();
        value_bms2.Balanced_state = (bb(batt2_accu, 8) * 256) + bb(batt2_accu, 7);
        value_bms2.Balanced_state_msg = [];
        if ((value_bms2.Balanced_state & 0x01) == 0x01) value_bms2.Balanced_state_msg.push("1");
        if ((value_bms2.Balanced_state & 0x02) == 0x02) value_bms2.Balanced_state_msg.push("2");
        if ((value_bms2.Balanced_state & 0x04) == 0x04) value_bms2.Balanced_state_msg.push("3");
        if ((value_bms2.Balanced_state & 0x08) == 0x08) value_bms2.Balanced_state_msg.push("4");
        if ((value_bms2.Balanced_state & 0x10) == 0x10) value_bms2.Balanced_state_msg.push("5");
        if ((value_bms2.Balanced_state & 0x20) == 0x20) value_bms2.Balanced_state_msg.push("6");
        if ((value_bms2.Balanced_state & 0x40) == 0x40) value_bms2.Balanced_state_msg.push("7");
        if ((value_bms2.Balanced_state & 0x80) == 0x80) value_bms2.Balanced_state_msg.push("8");
        if ((value_bms2.Balanced_state & 0x100) == 0x100) value_bms2.Balanced_state_msg.push("9");
        if ((value_bms2.Balanced_state & 0x200) == 0x200) value_bms2.Balanced_state_msg.push("10");
        if ((value_bms2.Balanced_state & 0x400) == 0x400) value_bms2.Balanced_state_msg.push("11");
        if ((value_bms2.Balanced_state & 0x800) == 0x800) value_bms2.Balanced_state_msg.push("12");
        if ((value_bms2.Balanced_state & 0x1000) == 0x1000) value_bms2.Balanced_state_msg.push("13");
        if ((value_bms2.Balanced_state & 0x2000) == 0x2000) value_bms2.Balanced_state_msg.push("14");
        if ((value_bms2.Balanced_state & 0x4000) == 0x4000) value_bms2.Balanced_state_msg.push("15");
        if ((value_bms2.Balanced_state & 0x8000) == 0x8000) value_bms2.Balanced_state_msg.push("16");
        value_bms2.Balanced_state = value_bms2.Balanced_state.toString(2);

        tmp = bb(batt2_accu, 9);
        value_bms2.Protection_state = tmp;
        value_bms2.Protection_state_msg = [];
        if ((value_bms2.Protection_state & 0x01) == 0x01) value_bms2.Protection_state_msg.push("Single overvoltage protection");
        if ((value_bms2.Protection_state & 0x02) == 0x02) value_bms2.Protection_state_msg.push("Single undervoltage protection");
        if ((value_bms2.Protection_state & 0x04) == 0x04) value_bms2.Protection_state_msg.push("Whole group overvoltage protection");
        if ((value_bms2.Protection_state & 0x08) == 0x08) value_bms2.Protection_state_msg.push("Whole group undervoltage protection");
        if ((value_bms2.Protection_state & 0x10) == 0x10) value_bms2.Protection_state_msg.push("(Charge) over temperature protection");
        if ((value_bms2.Protection_state & 0x20) == 0x20) value_bms2.Protection_state_msg.push("(Charge) under temperature protection");
        if ((value_bms2.Protection_state & 0x40) == 0x40) value_bms2.Protection_state_msg.push("(discharge) over temperature protection");
        if ((value_bms2.Protection_state & 0x80) == 0x80) value_bms2.Protection_state_msg.push("(discharge) under temperature protection");
        if ((value_bms2.Protection_state & 0x100) == 0x100) value_bms2.Protection_state_msg.push("(charge) over current protect");
        if ((value_bms2.Protection_state & 0x200) == 0x200) value_bms2.Protection_state_msg.push("(discharge) over current protect");
        if ((value_bms2.Protection_state & 0x400) == 0x400) value_bms2.Protection_state_msg.push("short protect");
        if ((value_bms2.Protection_state & 0x800) == 0x800) value_bms2.Protection_state_msg.push("Front detection IC error");
        if ((value_bms2.Protection_state & 0x1000) == 0x1000) value_bms2.Protection_state_msg.push("Software lock MOS");
        value_bms2.Protection_state = tmp.toString(2);
        value_bms2.BMS_Software_version = batt2_accu[20];
        value_bms2.RSOC = batt2_accu[21];
        if (batt2_accu[22] & 1 == 1) value_bms2.MOSFET_Charge = 1;
        else value_bms2.MOSFET_Charge = 0;
        if (batt2_accu[22] & 10 == 10) value_bms2.MOSFET_Discharge = 1;
        else value_bms2.MOSFET_Discharge = 0;
        value_bms2.Battery_serial = batt2_accu[23];
        value_bms2.NTC_quantity = batt2_accu[24];
        value_bms2.NTC_content = [];

        for (let i = 0; i < value_bms2.NTC_quantity * 2; i += 2) {
            let tt = ((batt2_accu[25 + i] * 256) + batt2_accu[26 + i]);
            tt = tt - 2731;
            value_bms2.NTC_content.push(tof(tt * 0.1));
        }
        value_bms2.Alive = 0;
    } else if (batt2_command == 4) {
        value_bms2.cell_volt = [];
        for (let i = 1; i <= value_bms2.Battery_serial; i++) {
            let tt = bb(batt2_accu, i);
            value_bms2.cell_volt.push(tofn(tt / 1000, 3));
        }
        value_bms2.Alive = 0;
        //console.log(val_bat2);
    }
}




function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}


function btoh(fr) {
    return ('00' + fr.toString(16)).slice(-2).toUpperCase();
}



function bb(ar, num) { // batt 데이터 추출
    return ((ar[(2 * num)] * 256) + ar[(2 * num) + 1]);
}

function sint(tmp) { // signed int 형태로 들어온 2byte binaly data를 signed로 변형한다.
    return tmp > 0x7FFF ? tmp - 65536 : tmp;
}



/*
port.open(function(err) {
    if (err) {
        return console.log('!?Error opening port: ', err.message);
    };
});
*/

var crc_fail = 0;
var data_accu = null; // 데이터 수신 및 누적하는 함수
var data_stage = 0; // 데이터 수신 스테이지
var data_type = null; // 데이터 타입
var data_rcv_count = 0; // 데이터 실제 수신 갯수
var data_length; // 데이터 길이
var data_crc1 = null; // CRC1
var data_crc2 = null;

function func_opti_rcv(rcv) {

    var rcv_char = String.fromCharCode(rcv);
    //console.log(rcv_char);
    //process.stdout.write(rcv_char);
    // stage 0 : waiting Header
    if (data_stage == 0 && rcv_char == '^') {
        data_stage = 1;
        data_accu = "^";
        data_length = 0;
        data_rcv_count = 1;
        data_crc1 = null;
        data_crc2 = null;
    }
    // stage 1 : waiting : data type
    else if (data_stage == 1) {
        if (rcv_char == '0' || rcv_char == '1') {
            data_accu += rcv_char;
            data_stage = 6;
            data_rcv_count = 2;
        } else {
            data_type = rcv_char;
            data_accu += rcv_char;
            data_stage = 2;
            data_rcv_count = 2;
        }
    }
    // stage 2 : waiting : data length of X 100
    else if (data_stage == 2) {
        data_length = parseInt(rcv_char) * 100;
        data_accu += rcv_char;
        data_stage = 3;
        data_rcv_count = 3;
    }

    // stage 3 : waiting : data length of X 10
    else if (data_stage == 3) {
        data_length += parseInt(rcv_char) * 10;
        data_accu += rcv_char;
        data_stage = 4;
        data_rcv_count = 4;
    }
    // stage 4 : waiting : data length of X 1
    else if (data_stage == 4) {
        data_length += parseInt(rcv_char);
        data_accu += rcv_char;
        data_stage = 5;
        data_rcv_count = 5;
    }
    // stage 5 : waiting : data
    else if (data_stage == 5 && data_rcv_count < (data_length + 2)) {
        data_accu += rcv_char;
        data_rcv_count++;
        if (data_rcv_count == (data_length + 2)) { data_stage = 6; }
    }
    // stage 6 : waiting : crc1
    else if (data_stage == 6) {
        data_crc1 = rcv;
        data_stage = 7;
    }
    // stage 7 : waiting : crc2
    else if (data_stage == 7) {
        data_crc2 = rcv;
        data_stage = 8;
    }
    // stage 8 : waiting \r and end
    else if (data_stage == 8 && rcv_char == "\r") {
        var crccalc = crc.crc16xmodem(data_accu);
        if (crccalc == (data_crc1 * 0x100 + data_crc2)) {
            parser(data_accu, data_type, data_length, data_rcv_count);
            crc_fail = 0;
            //console.log("Collect!");
        } else {
            crc_fail++;
            //process.stdout.write("CRC FAIL = length/cnt:" + data_length + "/" + data_rcv_count + "-" + data_accu + "/CRC/" + data_crc1.toString(16).toUpperCase() + "-" + data_crc2.toString(16).toUpperCase() + "/=" + crccalc.toString(16).toUpperCase() + "\n");
        }
        //process.stdout.write("length/cnt:" + data_length + "/" + data_rcv_count + "-" + data_accu + "CRC" + data_crc1.toString(16).toUpperCase() + "-" + data_crc2.toString(16).toUpperCase() + "/=" + crccalc.toString(16).toUpperCase() + "\n");
        //process.stdout.write("\rOK=" + crc_ok + "/FAIL=" + crc_fail);
        data_stage = 0;
        //console.log(data_accu);
        //process.stdout.write('e');
    } else {
        data_stage = 0;
        //console.log("!?");
    }

}

/*
 AAAAA Solar input power 1     A: 0~9, unit: W
 BBBBB Solar input power 2     B: 0~9, unit: W 
±CCCCC Reserved                C: 0~9, unit: W, +: charge, -: discharge 
±DDDDD Reserved                D: 0~9, unit: W, +: input, -: output 
±EEEEE Reserved                E: 0~9, unit: W, +: input, -: output
±FFFFF Reserved                F: 0~9, unit: W, +: input, -: output 
±GGGGG Reserved                G: 0~9, unit: W, +: input, -: output 
 HHHHH AC output active power  R H: 0~9, unit: W 
 IIIII Reserved                I: 0~9, unit: W 
 JJJJJJ Reserved               J: 0~9, unit: W 
 KKKKK AC output total active power K: 0~9, unit: W 
 LLLLL AC output apperent power R L: 0~9, unit: VA 
 MMMMM Reserved M: 0~9, unit: VA
 NNNNN Reserved N: 0~9, unit: VA
 OOOOOO AC output total apperent power O: 0~9, unit: VA
 PPP AC output power percentage P: 0~9, unit: %
 Q AC output connect status 0: disconnect, 1: connect
 R Solar input 1 work status 0: idle, 1: work
 S Solar input 2 work status 0: idle, 1: work
 T Battery power direction 0: donothing, 1: charge, 2: discharge
 U DC/AC power direction 0: donothing, 1: AC-DC, 2: DC-AC
 V Line power direction 0: donothing, 1: input, 2: output
*/

var value_ps = {
    Solar_input_power1: 0,
    Solar_input_power2: 0,
    AC_output_active_power: 0,
    AC_output_total_active_power: 0,
    AC_output_apperent_power: 0,
    AC_output_total_apperent_power: 0,
    AC_output_power_percentage: 0,
    AC_output_connect_status: 0,
    Solar_input_1_work_status: 0,
    Solar_input_2_work_status: 0,
    Battery_power_direction: 0,
    power_direction_DCAC: 0,
    power_direction_line: 0,
    Alive: 99,
};

var value_ps_a = {
    Solar_input_power1: [],
    Solar_input_power2: [],
    AC_output_active_power: [],
    AC_output_total_active_power: [],
    AC_output_apperent_power: [],
    AC_output_total_apperent_power: [],
    AC_output_power_percentage: [],
    AC_output_connect_status: 0,
    Solar_input_1_work_status: 0,
    Solar_input_2_work_status: 0,
    Battery_power_direction: 0,
    power_direction_DCAC: 0,
    power_direction_line: 0,
    Alive: 99,
};

var value_ps_q = {
    Solar_input_power1: 0,
    Solar_input_power2: 0,
    AC_output_active_power: 0,
    AC_output_total_active_power: 0,
    AC_output_apperent_power: 0,
    AC_output_total_apperent_power: 0,
    AC_output_power_percentage: 0,
    AC_output_connect_status: 0,
    Solar_input_1_work_status: 0,
    Solar_input_2_work_status: 0,
    Battery_power_direction: 0,
    power_direction_DCAC: 0,
    power_direction_line: 0,
    Alive: 99,
};


var value_gs = {
    Solar_input_voltage_1: 0,
    Solar_input_voltage_2: 0,
    Solar_input_current_1: 0,
    Solar_input_current_2: 0,
    Battery_voltage: 0,
    Battery_capacity: 0,
    Battery_current: 0,
    Battery_power: 0,
    AC_input_voltage_R: 0,
    //AC_input_voltage_S: 0,
    //AC_input_voltage_T: 0,
    AC_input_frequency: 0,
    //AC_input_current_R: 0,
    //AC_input_current_S: 0,
    //AC_input_current_T: 0,
    AC_output_voltage_R: 0,
    //AC_output_voltage_S: 0,
    //AC_output_voltage_T: 0,
    AC_output_frequency: 0,
    //AC_output_current_R: 0,
    //AC_output_current_S: 0,
    //AC_output_current_T: 0,
    Inner_temperature: 0,
    Component_max_temperature: 0,
    External_battery_temperature: 0,
    Alive: 99,
    cnt: 0
};

var value_gs_a = {
    Solar_input_voltage_1: [],
    Solar_input_voltage_2: [],
    Solar_input_current_1: [],
    Solar_input_current_2: [],
    Battery_voltage: [],
    Battery_capacity: [],
    Battery_current: [],
    Battery_power: [],
    AC_input_voltage_R: [],
    AC_input_frequency: [],
    AC_output_voltage_R: [],
    AC_output_frequency: [],
    Inner_temperature: [],
    Component_max_temperature: [],
    External_battery_temperature: [],
    Alive: 99,
    cnt: 0
};

var value_gs_q = {
    Solar_input_voltage_1: 0,
    Solar_input_voltage_2: 0,
    Solar_input_current_1: 0,
    Solar_input_current_2: 0,
    Battery_voltage: 0,
    Battery_capacity: 0,
    Battery_current: 0,
    Battery_power: 0,
    AC_input_voltage_R: 0,
    //AC_input_voltage_S: 0,
    //AC_input_voltage_T: 0,
    AC_input_frequency: 0,
    //AC_input_current_R: 0,
    //AC_input_current_S: 0,
    //AC_input_current_T: 0,
    AC_output_voltage_R: 0,
    //AC_output_voltage_S: 0,
    //AC_output_voltage_T: 0,
    AC_output_frequency: 0,
    //AC_output_current_R: 0,
    //AC_output_current_S: 0,
    //AC_output_current_T: 0,
    Inner_temperature: 0,
    External_battery_temperature: 0,
    Alive: 99,
    cnt: 0
};

/*
var value_gs_a = cloneobj(value_gs); // 분단위 누적될 변수
var value_gs_m = cloneobj(value_gs); // 분단위 현재 값
var value_gs_z = cloneobj(value_gs); // 값을 초기화 하기 위한 초기값 저장 변수
*/

function parser(str, type, length, rcv_count) {
    //console.log("!");
    //console.log(str.slice(1, 5));
    //console.log(str);

    var strtype = str.slice(1, 5);
    var strtmp, spstr;

    if (strtype.includes('D078')) { // General Status
        //console.log(str);
        strtmp = (str.slice(5));
        spstr = strtmp.split(",");
        value_gs.Solar_input_voltage_1 = spstr[0] / 10;
        value_gs.Solar_input_voltage_2 = spstr[1] / 10;
        value_gs.Solar_input_current_1 = spstr[2] / 100;
        value_gs.Solar_input_current_2 = spstr[3] / 100;
        value_gs.Battery_voltage = spstr[4] / 10;
        value_gs.Battery_capacity = spstr[5] * 1;
        value_gs.Battery_current = spstr[6] / 10;
        value_gs.Battery_power = tof(value_gs.Battery_voltage * value_gs.Battery_current);
        if (value_gs.Battery_power == 0) value_gs.Battery_power -= 53;

        //console.log(value_gs.Battery_power);
        value_gs.AC_input_voltage_R = spstr[7] / 10;
        //value_gs.AC_input_voltage_S = spstr[8] / 10;
        //value_gs.AC_input_voltage_T = spstr[9] / 10;
        value_gs.AC_input_frequency = spstr[10] / 100;
        //value_gs.AC_input_current_R = spstr[11] / 10;
        //value_gs.AC_input_current_S = spstr[12] / 10;
        //value_gs.AC_input_current_T = spstr[13] / 10;
        value_gs.AC_output_voltage_R = spstr[14] / 10;
        //value_gs.AC_output_voltage_S = spstr[15] / 10;
        //value_gs.AC_output_voltage_T = spstr[16] / 10;
        value_gs.AC_output_frequency = spstr[17] / 100;
        //value_gs.AC_output_current_R = spstr[18] / 10;
        //value_gs.AC_output_current_S = spstr[19] / 10;
        //value_gs.AC_output_current_T = spstr[20] / 10;
        value_gs.Inner_temperature = spstr[21] * 1;
        value_gs.Component_max_temperature = spstr[22] * 1;
        value_gs.External_battery_temperature = spstr[23] * 1;
        value_gs.Alive = 0;

        //console.log("Battery_V:" + value_gs.Battery_voltage + "/B_A:" + value_gs.Battery_current + "/B_C:" + tofn(get_bat_capa()));

        var bb = 0;
        var d = new Date();
        if (value_gs.Battery_voltage > 56.5 && value_gs.Battery_current < 5) {
            if (value_ps_a.Alive < time_out && value_gs_a.Alive < time_out) {
                bb = ((value_gs_a.Battery_power.average() - 0 /*55.1*/ ) * (((d.getMinutes() * 60 + d.getSeconds()) % 900) / 900) / 4);
            }
            batcapa = set.ESS_Total_Capacity * 1000 - bb;
        }
        if (value_gs.Battery_voltage <= 47 && value_gs.Battery_voltage > 40) {
            if (value_ps_a.Alive < time_out && value_gs_a.Alive < time_out) {
                bb = ((value_gs_a.Battery_power.average() - 0 /*55.1*/ ) * (((d.getMinutes() * 60 + d.getSeconds()) % 900) / 900) / 4);
            }
            batcapa = 0 - bb;
        }

        //console.log(value_gs);

        // 15분단위 누적
        value_gs_a.Solar_input_voltage_1.push(value_gs.Solar_input_voltage_1);
        value_gs_a.Solar_input_voltage_2.push(value_gs.Solar_input_voltage_2);
        value_gs_a.Solar_input_current_1.push(value_gs.Solar_input_current_1);
        value_gs_a.Solar_input_current_2.push(value_gs.Solar_input_current_2);
        value_gs_a.Battery_voltage.push(value_gs.Battery_voltage);
        value_gs_a.Battery_capacity.push(value_gs.Battery_capacity);
        value_gs_a.Battery_current.push(value_gs.Battery_current);
        value_gs_a.Battery_power.push(value_gs.Battery_power);
        value_gs_a.AC_input_voltage_R.push(value_gs.AC_input_voltage_R);
        value_gs_a.AC_input_frequency.push(value_gs.AC_input_frequency);
        value_gs_a.AC_output_voltage_R.push(value_gs.AC_output_voltage_R);
        value_gs_a.AC_output_frequency.push(value_gs.AC_output_frequency);
        value_gs_a.Inner_temperature.push(value_gs.Inner_temperature);
        value_gs_a.Component_max_temperature.push(value_gs.Component_max_temperature);
        value_gs_a.External_battery_temperature.push(value_gs.External_battery_temperature);
        value_gs_a.Alive = 0;
    }

    /*
00    AAAAA Solar input power 1     A: 0~9, unit: W
01    BBBBB Solar input power 2     B: 0~9, unit: W 
02    ±CCCCC Reserved                C: 0~9, unit: W, +: charge, -: discharge 
03    ±DDDDD Reserved                D: 0~9, unit: W, +: input, -: output 
04    ±EEEEE Reserved                E: 0~9, unit: W, +: input, -: output
05    ±FFFFF Reserved                F: 0~9, unit: W, +: input, -: output 
06    ±GGGGG Reserved                G: 0~9, unit: W, +: input, -: output 
07    HHHHH AC output active power  R H: 0~9, unit: W 
08    IIIII Reserved                I: 0~9, unit: W 
09    JJJJJJ Reserved               J: 0~9, unit: W 
10    KKKKK AC output total active power K: 0~9, unit: W 
11    LLLLL AC output apperent power R L: 0~9, unit: VA 
12    MMMMM Reserved M: 0~9, unit: VA
13    NNNNN Reserved N: 0~9, unit: VA
14    OOOOOO AC output total apperent power O: 0~9, unit: VA
15    PPP AC output power percentage P: 0~9, unit: %
16    Q AC output connect status 0: disconnect, 1: connect
17    R Solar input 1 work status 0: idle, 1: work
18    S Solar input 2 work status 0: idle, 1: work
19    T Battery power direction 0: donothing, 1: charge, 2: discharge
20    U DC/AC power direction 0: donothing, 1: AC-DC, 2: DC-AC
21    V Line power direction 0: donothing, 1: input, 2: output
    */
    //^D06100000,00000,,,,,,0408,,,00408,0836,,,00836,016,1,0,0,1,1,1
    //     0     1          7      10    11     14    15  6 7 8 9 0 21
    else if (strtype.includes('D061')) { // General Status
        //console.log(str);
        strtmp = (str.slice(5));
        spstr = strtmp.split(",");
        value_ps.Solar_input_power1 = spstr[0] * 1;
        value_ps.Solar_input_power2 = spstr[1] * 1;
        value_ps.AC_output_active_power = spstr[7] * 1;
        value_ps.AC_output_total_active_power = spstr[10] * 1;
        value_ps.AC_output_apperent_power = spstr[11] * 1;
        value_ps.AC_output_total_apperent_power = spstr[14] * 1;
        value_ps.AC_output_power_percentage = spstr[15] * 1;
        value_ps.AC_output_connect_status = spstr[16] * 1;
        value_ps.Solar_input_1_work_status = spstr[17] * 1;
        value_ps.Solar_input_2_work_status = spstr[18] * 1;
        value_ps.Battery_power_direction = spstr[19] * 1;
        value_ps.power_direction_DCAC = spstr[20] * 1;
        value_ps.power_direction_line = spstr[21] * 1;


        if (value_ps.AC_output_connect_status == 0) value_ps.AC_output_connect_status = 'connect';
        else value_ps.AC_output_connect_status = 'disconnect';
        if (value_ps.Solar_input_1_work_status == 0) value_ps.Solar_input_1_work_status = 'idle';
        else value_ps.Solar_input_1_work_status = 'work';
        if (value_ps.Solar_input_2_work_status == 0) value_ps.Solar_input_2_work_status = 'idle';
        else value_ps.Solar_input_2_work_status = 'work';
        if (value_ps.Battery_power_direction == 0) value_ps.Battery_power_direction = 'donothing';
        else if (value_ps.Battery_power_direction == 1) value_ps.Battery_power_direction = 'charge';
        else value_ps.Battery_power_direction = 'discharge';
        if (value_ps.power_direction_DCAC == 0) value_ps.power_direction_DCAC = 'donothing';
        else if (value_ps.power_direction_DCAC == 1) value_ps.power_direction_DCAC = 'AC-DC';
        else value_ps.power_direction_DCAC = 'DC-AC';
        if (value_ps.power_direction_line == 0) value_ps.power_direction_line = 'donothing';
        else if (value_ps.power_direction_line == 1) value_ps.power_direction_line = 'input';
        else value_ps.power_direction_line = 'output';

        value_ps.Alive = 0;
        //console.log(value_ps);

        // 15분단위 누적
        value_ps_a.Solar_input_power1.push(value_ps.Solar_input_power1);
        value_ps_a.Solar_input_power2.push(value_ps.Solar_input_power2);
        value_ps_a.AC_output_active_power.push(value_ps.AC_output_active_power);
        value_ps_a.AC_output_total_active_power.push(value_ps.AC_output_total_active_power);
        value_ps_a.AC_output_apperent_power.push(value_ps.AC_output_apperent_power);
        value_ps_a.AC_output_total_apperent_power.push(value_ps.AC_output_total_apperent_power);
        value_ps_a.AC_output_power_percentage.push(value_ps.AC_output_power_percentage);
        value_ps_a.AC_output_connect_status = value_ps.AC_output_connect_status;
        value_ps_a.Solar_input_1_work_status = value_ps.Solar_input_1_work_status;
        value_ps_a.Solar_input_2_work_status = value_ps.Solar_input_2_work_status;
        value_ps_a.Battery_power_direction = value_ps.Battery_power_direction;
        value_ps_a.power_direction_DCAC = value_ps.power_direction_DCAC;
        value_ps_a.power_direction_line = value_ps.power_direction_line;
        value_ps_a.Alive = 0;
    } else {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "opti unmanage sentence" + str);
    }
}

var moderun = '';

function mode_charge(force) {
    if (moderun != 'Charging') {
        if (force == true) moderun = 'ForceCharging';
        else moderun = 'Charging';
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "" + "Charge MODE!");

        //S005EDB1만 하면 AC로 충전은 되도록 셋팅됨.
        port.write("^S005EDA1\r"); // 배터리 충전 허용
        port.write("^S005EDB1\r"); // 배터리 AC충전 허용
        //port.write("^S005EDC0\r"); // 공공망에 파워 공급 허용 X
        port.write("^S005EDD0\r"); // 태양광 입력이 정상일때 부하로 배터리 방전을 허용.
        port.write("^S005EDE0\r"); // 태양광 입력이 없을때 배터리 방전을 허용.
        //port.write("^S005EDF0\r"); // 태양광 입력이 정상일때 공공망으로 배터리 방전 X
        //port.write("^S005EDG0\r"); // 태양광 입력이 없을때 공공망으로 배터리 방전 X
        //port.write("^S005EDH1\r"); // 공급파워에 따라 PF 자동 조절 비활성화(sp10K만 있음)
        // 1101100
    }
}

function mode_discharge(force) {
    if (moderun != 'Discharging') {
        if (force == true) moderun = 'ForceDischarging';
        else moderun = 'Discharging';
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "" + "Discharge MODE!");
        //port.write("S011GPMP009300\r");
        port.write("^S005EDA1\r"); // 배터리 충전 X
        port.write("^S005EDB0\r"); // 배터리 AC충전 X
        //port.write("^S005EDC0\r"); // 공공망에 파워 공급 허용 X
        port.write("^S005EDD1\r"); // 태양광 입력이 정상일때 부하로 배터리 방전 허용
        port.write("^S005EDE1\r"); // 태양광 입력이 없을때 배터리 방전을 허용
        //port.write("^S005EDF0\r"); // 태양광 입력이 정상일때 공공망으로 배터리 방전 X
        //port.write("^S005EDG0\r"); // 태양광 입력이 없을때 공공망으로 배터리 방전 X
        //port.write("^S005EDH1\r"); // 공급파워에 따라 PF 자동 조절 비활성화(sp10K만 있음)
    }
}

function mode_idle(force) {
    if (moderun != 'Standby') {
        if (force == true) moderun = 'ForceStandby';
        else moderun = 'Standby';
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "" + "IDLE MODE");
        port.write("^S005EDA1\r"); // 배터리 충전 X
        port.write("^S005EDB0\r"); // 배터리 AC충전 X
        //port.write("^S005EDC0\r"); // 공공망에 파워 공급 허용 X
        port.write("^S005EDD0\r"); // 태양광 입력이 정상일때 부하로 배터리 방전 
        port.write("^S005EDE0\r"); // 태양광 입력이 없을때 배터리 방전 
        //port.write("^S005EDF0\r"); // 태양광 입력이 정상일때 공공망으로 배터리 방전 X
        //port.write("^S005EDG0\r"); // 태양광 입력이 없을때 공공망으로 배터리 방전 X
        //port.write("^S005EDH0\r"); // 공급파워에 따라 PF 자동 조절 비활성화(sp10K만 있음)
    }
}

function send_opti_with_crc(sendstr) {
    /*
    var chk = checksum(sendstr).toString();
    chk = zerofil(chk);
    sendstr += chk;
    console.log(sendstr);
    port.write(sendstr + "\r");
    */
    var chk = crc.crc16xmodem(sendstr);
    var cr1 = chk / 0x100;
    console.log(chk + "/" + cr1);
    cr1 = cr1 - (cr1 % 1);
    console.log(chk + "/" + cr1);
    var cr2 = chk % 0x100;
    console.log(chk + "/" + cr2);
    //chk = zerofil(chk);
    sendstr += cr1;
    sendstr += cr2;
    console.log(sendstr);
    port.write(sendstr + "\r");
}

// create an empty modbus client 
var ModbusRTU = require("modbus-serial");
var client_modbus_grid = new ModbusRTU();
var client_modbus_load = new ModbusRTU();

// open connection to a serial port 
client_modbus_grid.connectRTUBuffered(set.port_pm_grid, { baudRate: 9600 });
client_modbus_grid.setID(1);
client_modbus_load.connectRTUBuffered(set.port_pm_load, { baudRate: 9600 });
client_modbus_load.setID(1);

var value_mb_load = { volt: 0, current: 0, active_pwr: 0, apparent_pwr: 0, reactive_pwr: 0, pf: 0, hz: 0, import_active_energy: 0, export_active_energy: 0, import_reactive_energy: 0, export_reactive_energy: 0, total_active_energy: 0, total_reactive_energy: 0, Alive: 99, cnt: 0 };
var value_mb_load_a = { volt: [], current: [], active_pwr: [], apparent_pwr: [], reactive_pwr: [], pf: [], hz: [], past_import_active_energy: 0, past_export_active_energy: 0, past_import_reactive_energy: 0, past_export_reactive_energy: 0, past_total_active_energy: 0, past_total_reactive_energy: 0, import_active_energy: 0, export_active_energy: 0, import_reactive_energy: 0, export_reactive_energy: 0, total_active_energy: 0, total_reactive_energy: 0, Alive: 99, cnt: 0 };
//var value_mb_load_q = { volt: 0, current: 0, active_pwr: 0, apparent_pwr: 0, reactive_pwr: 0, pf: 0, hz: 0, import_active_energy: 0, export_active_energy: 0, import_reactive_energy: 0, export_reactive_energy: 0, total_active_energy: 0, total_reactive_energy: 0, Alive: 99, cnt: 0 };

var value_mb_grid = { volt: 0, current: 0, active_pwr: 0, apparent_pwr: 0, reactive_pwr: 0, pf: 0, hz: 0, import_active_energy: 0, export_active_energy: 0, import_reactive_energy: 0, export_reactive_energy: 0, total_active_energy: 0, total_reactive_energy: 0, Alive: 99, cnt: 0 };
var value_mb_grid_a = { volt: [], current: [], active_pwr: [], apparent_pwr: [], reactive_pwr: [], pf: [], hz: [], past_import_active_energy: 0, past_export_active_energy: 0, past_import_reactive_energy: 0, past_export_reactive_energy: 0, past_total_active_energy: 0, past_total_reactive_energy: 0, import_active_energy: 0, export_active_energy: 0, import_reactive_energy: 0, export_reactive_energy: 0, total_active_energy: 0, total_reactive_energy: 0, Alive: 99, cnt: 0 };
//var value_mb_grid_q = { volt: 0, current: 0, active_pwr: 0, apparent_pwr: 0, reactive_pwr: 0, pf: 0, hz: 0, import_active_energy: 0, export_active_energy: 0, import_reactive_energy: 0, export_reactive_energy: 0, total_active_energy: 0, total_reactive_energy: 0, Alive: 99, cnt: 0 };




app.get("/send_opti", function(req, res) {
    var ins = req.query.ins;
    console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "send_opti " + "ins = " + ins);
    port.write(ins + "\r");
    res.json('ok');
});

app.get("/set_mode", function(req, res) {
    var ins = req.query.ins;
    if (ins == 1) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "set_mode /" + "charge!");
        mode_charge(false);
    } else if (ins == 2) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "set_mode /" + "discharge!");
        mode_discharge(false);
    } else if (ins == 3) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "set_mode /" + "idle!");
        mode_idle(false);
    } else if (ins == 'a') {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "set_mode /" + "force charge!");
        mode_charge(true);
    } else if (ins == 'b') {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "set_mode /" + "force discharge!");
        mode_discharge(true);
    } else if (ins == 'c') {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "set_mode /" + "force idle!");
        mode_idle(true);
    }

    res.json('ok');
});

app.get("/set", function(req, res) {
    var ins = req.query.ins;
    var aaa;
    if (ins == 0) {
        mode_idle();
    }
    if (ins == 1) aaa = 12;
    if (ins == 2) aaa = 18;
    if (ins == 3) aaa = 20;
    if (ins == 4) aaa = 28;
    if (ins == 5) aaa = 86;
    if (ins == 6) aaa = 0xf900;
    if (ins == 7) aaa = 0xf910;
    console.log(ins + "/" + aaa);
    client_modbus_grid.readHoldingRegisters(ins, 2, function(err, rcdata) {
        if (err) {
            console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err);
            throw err;
        } else {
            console.log(rcdata);
        }
    });
    res.json('ok');
});

// sdm120에서 버튼을 3초이상 눌러서 -SET-이 떴을때 baudrate를 2400에서 9600 으로 바꿈
app.get("/set1", function(req, res) {
    var tttt = [0x4000, 0x0000]; // float으로 2는  0x4000 0000이다...
    client_modbus_grid.writeRegisters(28, tttt);
    res.json('ok');
});
// sdm120에서 set상태에서 id를 바꾼다. 아래는 2 그다음은 1
app.get("/set2", function(req, res) {
    client_modbus_grid.setID(1);
    var tttt = [0x4000, 0x0000];
    client_modbus_grid.writeRegisters(20, tttt);
    res.json('ok');
});

app.get("/set3", function(req, res) {
    client_modbus_grid.setID(0);
    var tttt = [0x3f80, 0x0000];
    client_modbus_grid.writeRegisters(20, tttt);
    res.json('ok');
});


var tick = 0;
// optisolar 수신 ps와 gs 0.5초 간격으로
setInterval(function() {
    try {
        if (tick == 0) {
            port.write("^P003PS\r"); // query power status
            tick = 1;
        } else { // if(tick == 1){

            port.write("^P003GS\r"); // query general status
            tick = 0;
            //tick = 2;
        }
        /*
        else
        {
            port.write("^P003DI\r"); // query chargeable parameter
            tick = 0;
        }
        */
    } catch (err) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "opti tick error " + err);
    }
}, 500);


var tickbat = 0;
// optisolar 수신 ps와 gs 0.5초 간격으로
setInterval(function() {
    try {
        let tmp;
        //console.log("tickbat = " + tickbat);
        if (tickbat == 0) {
            tickbat = 1;
            tmp = [0xDD, 0xA5, 0x03, 0x00, 0xFF, 0xFD, 0x77];
            //console.log(" 3보낸다!");
            //port_bat1.write(tmp); // query power status
            port_bat1.write(tmp); // query power status
            port_bat2.write(tmp); // query power status
        } else if (tickbat == 1) {
            tickbat = 0;
            tmp = [0xDD, 0xA5, 0x04, 0x00, 0xFF, 0xFC, 0x77];
            //console.log(" 4보낸다!");
            //port_bat1.write(tmp); // query power status
            port_bat1.write(tmp); // query power status
            port_bat2.write(tmp); // query power status
        }
        //port_bat2.write(tmp); // query power status
    } catch (err) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "bat tick error " + err);
    }
}, 500);


var called = false;
var stucked = 0;
var step = 1;
setInterval(function() {
    try {
        var n = 4;
        if (called == true) {
            stucked++;
            if (stucked >= 6) {
                called = false;
                stucked = 0;
                //console.log("뷁" + step);
            }
            return;
        } else
            stucked = 0;

        if (step == 1) { // grid
            called = true;
            stucked = 0;
            step++;
            //process.stdout.write('e');
            client_modbus_grid.readInputRegisters(0, 14, function(err, rcdata) { // 15+14 = 29개
                //process.stdout.write('E');
                called = false;
                if (err) { console.log(moment().format('YYYY-MM-DD HH:mm:ss') + '/ mb1 stage1 ' + err); return; }
                if (typeof(rcdata.buffer) == "undefined") return;
                value_mb_grid.volt = tof(rcdata.buffer.readFloatBE(n * 0));
                value_mb_grid.current = tofn(rcdata.buffer.readFloatBE(n * 3), 3);
                value_mb_grid.active_pwr = tof(rcdata.buffer.readFloatBE(n * 6));
                value_mb_grid.Alive = 0;
                // 15분 단위 누적
                value_mb_grid_a.volt.push(value_mb_grid.volt);
                value_mb_grid_a.current.push(value_mb_grid.current);
                value_mb_grid_a.active_pwr.push(value_mb_grid.active_pwr);
                value_mb_grid_a.Alive = 0;
            });
        } else if (step == 2) { // 130이하 소요
            called = true;
            stucked = 0;
            step++;
            //process.stdout.write('f');
            client_modbus_grid.readInputRegisters(18, 14, function(err, rcdata) { //15+14=29개
                //process.stdout.write('F');
                called = false;
                if (err) { console.log(moment().format('YYYY-MM-DD HH:mm:ss') + '/ mb1 stage2 ' + err); return; }
                if (typeof(rcdata.buffer) == "undefined") return;
                value_mb_grid.apparent_pwr = tof(rcdata.buffer.readFloatBE(n * 0));
                value_mb_grid.reactive_pwr = tof(rcdata.buffer.readFloatBE(n * 3));
                value_mb_grid.pf = tofn(rcdata.buffer.readFloatBE(n * 6), 3);
                value_mb_grid.Alive = 0;
                // 15분 단위 누적
                value_mb_grid_a.apparent_pwr.push(value_mb_grid.apparent_pwr);
                value_mb_grid_a.reactive_pwr.push(value_mb_grid.reactive_pwr);
                value_mb_grid_a.pf.push(value_mb_grid.pf);
                value_mb_grid_a.Alive = 0;
            });
        } else if (step == 3) {
            called = true;
            stucked = 0;
            step++;
            //process.stdout.write('g');
            client_modbus_grid.readInputRegisters(70, 10, function(err, rcdata) { // 15+10 = 25개
                //process.stdout.write('G');
                called = false;
                if (err) { console.log(moment().format('YYYY-MM-DD HH:mm:ss') + '/ mb1 stage3 ' + err); return; }
                if (typeof(rcdata.buffer) == "undefined") return;
                value_mb_grid.hz = tofn(rcdata.buffer.readFloatBE(n * 0), 3);
                value_mb_grid.import_active_energy = tofn(rcdata.buffer.readFloatBE(n * 1), 3);
                value_mb_grid.export_active_energy = tofn(rcdata.buffer.readFloatBE(n * 2), 3);
                value_mb_grid.import_reactive_energy = tofn(rcdata.buffer.readFloatBE(n * 3), 3);
                value_mb_grid.export_reactive_energy = tofn(rcdata.buffer.readFloatBE(n * 4), 3);
                // 15분 단위 누적
                value_mb_grid_a.hz.push(value_mb_grid.hz);
                value_mb_grid_a.import_active_energy = tofn(value_mb_grid.import_active_energy, 3);
                value_mb_grid_a.export_active_energy = tofn(value_mb_grid.export_active_energy, 3);
                value_mb_grid_a.import_reactive_energy = tofn(value_mb_grid.import_reactive_energy, 3);
                value_mb_grid_a.export_reactive_energy = tofn(value_mb_grid.export_reactive_energy, 3);
                // 만약 이전 값이 0인상태 .. 처음 켠 상태라면 지금 당장의 값이라도 15분 이전의 계량값에 기록한다.
                if (value_mb_grid_a.past_import_active_energy == 0) value_mb_grid_a.past_import_active_energy = value_mb_grid_a.import_active_energy;
                if (value_mb_grid_a.past_export_active_energy == 0) value_mb_grid_a.past_export_active_energy = value_mb_grid_a.export_active_energy;
                if (value_mb_grid_a.past_import_reactive_energy == 0) value_mb_grid_a.past_import_reactive_energy = value_mb_grid_a.import_reactive_energy;
                if (value_mb_grid_a.past_export_reactive_energy == 0) value_mb_grid_a.past_export_reactive_energy = value_mb_grid_a.export_reactive_energy;
                value_mb_grid.Alive = 0;
                value_mb_grid_a.Alive = 0;
                //console.log("PM:"+value_mb.volt +"V / "+value_mb.current + "A / Act"+value_mb.active_pwr +"W / Pf" + value_mb.pf);
            });
        } else if (step == 4) { //90ms 이하
            called = true;
            stucked = 0;
            step = 1;
            //process.stdout.write('h');
            client_modbus_grid.readInputRegisters(342, 4, function(err, rcdata) { // 15+4 = 19개
                //process.stdout.write('H');
                called = false;
                if (err) { console.log(moment().format('YYYY-MM-DD HH:mm:ss') + '/ mb1 stage4 ' + err); return; }
                if (typeof(rcdata.buffer) == "undefined") return;
                value_mb_grid.total_active_energy = tofn(rcdata.buffer.readFloatBE(n * 0), 3);
                value_mb_grid.total_reactive_energy = tofn(rcdata.buffer.readFloatBE(n * 1), 3);
                // 15분 단위 누적
                value_mb_grid_a.total_active_energy = value_mb_grid.total_active_energy;
                value_mb_grid_a.total_reactive_energy = value_mb_grid.total_reactive_energy;
                if (value_mb_grid_a.past_total_active_energy == 0) value_mb_grid_a.past_total_active_energy = value_mb_grid_a.total_active_energy;
                if (value_mb_grid_a.past_total_reactive_energy == 0) value_mb_grid_a.past_total_reactive_energy = value_mb_grid_a.total_reactive_energy;
                value_mb_grid.Alive = 0;
                value_mb_grid_a.Alive = 0;
            });
        }
        //console.log(value_mb_grid);
        /*
            console.log("Solar:" + value_ps.Solar_input_power1 + "/Pm_ActPwr:" + value_mb.active_pwr + "/PM_Ap_PW" + value_mb.apparent_pwr + "/PM_Rea_PW" + value_mb.reactive_pwr +
            "/Opti_ActPwr:" + value_ps.AC_output_active_power + "/PF:" + value_mb.pf + "/Bat:" + value_gs.Battery_power + "W/A" + value_gs.Battery_current+"/"+value_ps.Battery_power_direction + "/" + value_gs.Battery_voltage +"v");
        */
    } catch (err) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err);
        //console.log(err);
    }
}, 40);
//delaydelay
var called2 = false;
var stucked2 = 0;
var step2 = 1;
setInterval(function() {
    try {
        var n = 4;
        if (called2 == true) {
            stucked2++;
            if (stucked2 >= 6) {
                called2 = false;
                stucked2 = 0;
                //console.log("뷁" + step2);
            }
            return;
        } else
            stucked2 = 0;
        if (step2 == 1) { // load
            called2 = true;
            stucked2 = 0;
            step2++;
            //process.stdout.write('a');
            client_modbus_load.readInputRegisters(0, 14, function(err, rcdata) { // 15+14 = 29개
                called2 = false;
                if (err) { console.log(moment().format('YYYY-MM-DD HH:mm:ss') + '/ mb2 stage1 ' + err); return; }
                if (typeof(rcdata.buffer) == "undefined") return;
                //process.stdout.write('A');
                value_mb_load.volt = tof(rcdata.buffer.readFloatBE(n * 0));
                value_mb_load.current = tofn(rcdata.buffer.readFloatBE(n * 3), 3);
                value_mb_load.active_pwr = tof(rcdata.buffer.readFloatBE(n * 6));
                value_mb_load.Alive = 0;
                // 15분 단위 누적
                value_mb_load_a.volt.push(value_mb_load.volt);
                value_mb_load_a.current.push(value_mb_load.current);
                value_mb_load_a.active_pwr.push(value_mb_load.active_pwr);
                value_mb_load_a.Alive = 0;
            });
        } else if (step2 == 2) { // 130이하 소요
            called2 = true;
            stucked2 = -2;
            step2++;
            //process.stdout.write('b');
            client_modbus_load.readInputRegisters(18, 14, function(err, rcdata) { //15+14=29개
                //process.stdout.write('B');
                called2 = false;
                if (err) { console.log(moment().format('YYYY-MM-DD HH:mm:ss') + '/ mb2 stage2 ' + err); return; }
                if (typeof(rcdata.buffer) == "undefined") return;
                value_mb_load.apparent_pwr = tof(rcdata.buffer.readFloatBE(n * 0));
                value_mb_load.reactive_pwr = tof(rcdata.buffer.readFloatBE(n * 3));
                value_mb_load.pf = tofn(rcdata.buffer.readFloatBE(n * 6), 3);
                value_mb_load.Alive = 0;
                // 15분 단위 누적
                value_mb_load_a.apparent_pwr.push(value_mb_load.apparent_pwr);
                value_mb_load_a.reactive_pwr.push(value_mb_load.reactive_pwr);
                value_mb_load_a.pf.push(value_mb_load.pf);
                value_mb_load_a.Alive = 0;
            });
        } else if (step2 == 3) {
            called2 = true;
            stucked2 = 0;
            step2++;
            //process.stdout.write('g');
            client_modbus_load.readInputRegisters(70, 10, function(err, rcdata) { // 15+10 = 25개
                //process.stdout.write('G');
                called2 = false;
                if (err) { console.log(moment().format('YYYY-MM-DD HH:mm:ss') + '/ mb2 stage3 ' + err); return; }
                if (typeof(rcdata.buffer) == "undefined") return;
                value_mb_load.hz = tofn(rcdata.buffer.readFloatBE(n * 0), 3);
                value_mb_load.import_active_energy = tofn(rcdata.buffer.readFloatBE(n * 1), 3);
                value_mb_load.export_active_energy = tofn(rcdata.buffer.readFloatBE(n * 2), 3);
                value_mb_load.import_reactive_energy = tofn(rcdata.buffer.readFloatBE(n * 3), 3);
                value_mb_load.export_reactive_energy = tofn(rcdata.buffer.readFloatBE(n * 4), 3);
                // 15분 단위 누적
                value_mb_load_a.hz.push(value_mb_load.hz);
                value_mb_load_a.import_active_energy = value_mb_load.import_active_energy;
                value_mb_load_a.export_active_energy = value_mb_load.export_active_energy;
                value_mb_load_a.import_reactive_energy = value_mb_load.import_reactive_energy;
                value_mb_load_a.export_reactive_energy = value_mb_load.export_reactive_energy;
                // 만약 이전 값이 0인상태 .. 처음 켠 상태라면 지금 당장의 값이라도 15분 이전의 계량값에 기록한다.
                if (value_mb_load_a.past_import_active_energy == 0) value_mb_load_a.past_import_active_energy = value_mb_load_a.import_active_energy;
                if (value_mb_load_a.past_export_active_energy == 0) value_mb_load_a.past_export_active_energy = value_mb_load_a.export_active_energy;
                if (value_mb_load_a.past_import_reactive_energy == 0) value_mb_load_a.past_import_reactive_energy = value_mb_load_a.import_reactive_energy;
                if (value_mb_load_a.past_export_reactive_energy == 0) value_mb_load_a.past_export_reactive_energy = value_mb_load_a.export_reactive_energy;
                value_mb_load.Alive = 0;
                value_mb_load_a.Alive = 0;
                //console.log("PM:"+value_mb.volt +"V / "+value_mb.current + "A / Act"+value_mb.active_pwr +"W / Pf" + value_mb.pf);
            });
        } else if (step2 == 4) { //90ms 이하
            called2 = true;
            stucked2 = -2;
            step2 = 1;
            //process.stdout.write('d');
            client_modbus_load.readInputRegisters(342, 4, function(err, rcdata) { // 15+4 = 19개
                //process.stdout.write('D');
                called2 = false;
                if (err) { console.log(moment().format('YYYY-MM-DD HH:mm:ss') + '/ mb2 stage4 ' + err); return; }
                if (typeof(rcdata.buffer) == "undefined") return;
                value_mb_load.total_active_energy = tofn(rcdata.buffer.readFloatBE(n * 0), 3);
                value_mb_load.total_reactive_energy = tofn(rcdata.buffer.readFloatBE(n * 1), 3);
                // 15분 단위 누적
                value_mb_load_a.total_active_energy = value_mb_load.total_active_energy;
                value_mb_load_a.total_reactive_energy = value_mb_load.total_reactive_energy;
                if (value_mb_load_a.past_total_active_energy == 0) value_mb_load_a.past_total_active_energy = value_mb_load_a.total_active_energy;
                if (value_mb_load_a.past_total_reactive_energy == 0) value_mb_load_a.past_total_reactive_energy = value_mb_load_a.total_reactive_energy;
                value_mb_load.Alive = 0;
                value_mb_load_a.Alive = 0;
            });
        }
        /*
            console.log("Solar:" + value_ps.Solar_input_power1 + "/Pm_ActPwr:" + value_mb.active_pwr + "/PM_Ap_PW" + value_mb.apparent_pwr + "/PM_Rea_PW" + value_mb.reactive_pwr +
            "/Opti_ActPwr:" + value_ps.AC_output_active_power + "/PF:" + value_mb.pf + "/Bat:" + value_gs.Battery_power + "W/A" + value_gs.Battery_current+"/"+value_ps.Battery_power_direction + "/" + value_gs.Battery_voltage +"v");
        */
    } catch (err) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err);
        //console.log(err);
    }
}, 40);
//delaydelay

var time_out = 50;
// 타임아웃 처리
setInterval(function() {
    try {
        //process.stdout.write("+"); 
        // timeout 계산용 증가
        value_mb_load.Alive++;
        value_mb_load_a.Alive++;
        value_mb_grid.Alive++;
        value_mb_grid_a.Alive++;
        value_gs.Alive++;
        value_ps.Alive++;
        value_gs_a.Alive++;
        value_ps_a.Alive++;
        value_gs_q.Alive++;
        value_ps_q.Alive++;
        value_bms1.Alive++;
        value_bms2.Alive++;
        resq.Alive++;
        // overflow 방지용
        if (value_mb_load.Alive > 1000) value_mb_load.Alive = 1000; // timeout
        if (value_gs.Alive > 1000) value_gs.Alive = 1000;
        if (value_ps.Alive > 1000) value_ps.Alive = 1000;
        if (value_mb_load_a.Alive > 1000) value_mb_load_a.Alive = 1000; // timeout
        if (value_gs_a.Alive > 1000) value_gs_a.Alive = 1000;
        if (value_ps_a.Alive > 1000) value_ps_a.Alive = 1000;
        if (value_gs_q.Alive > 1000) value_gs_q.Alive = 1000;
        if (value_ps_q.Alive > 1000) value_ps_q.Alive = 1000;
        if (value_bms1.Alive > 1000) value_bms1.Alive = 1000;
        if (value_bms2.Alive > 1000) value_bms2.Alive = 1000;
        if (resq.Alive > 1000) resq.Alive = 1000;

        if (value_mb_grid.Alive > time_out) {
            value_mb_grid.volt = 0;
            value_mb_grid.current = 0;
            value_mb_grid.active_pwr = 0;
            value_mb_grid.apparent_pwr = 0;
            value_mb_grid.reactive_pwr = 0;
            value_mb_grid.pf = 0;
            value_mb_grid.hz = 0;
            value_mb_grid_a.volt.push(0);
            value_mb_grid_a.current.push(0);
            value_mb_grid_a.active_pwr.push(0);
            value_mb_grid_a.apparent_pwr.push(0);
            value_mb_grid_a.reactive_pwr.push(0);
            value_mb_grid_a.pf.push(0);
            value_mb_grid_a.hz.push(0);
        }

        if (value_mb_load.Alive > time_out) {
            value_mb_load.volt = 0;
            value_mb_load.current = 0;
            value_mb_load.active_pwr = 0;
            value_mb_load.apparent_pwr = 0;
            value_mb_load.reactive_pwr = 0;
            value_mb_load.pf = 0;
            value_mb_load.hz = 0;
            value_mb_load_a.volt.push(0);
            value_mb_load_a.current.push(0);
            value_mb_load_a.active_pwr.push(0);
            value_mb_load_a.apparent_pwr.push(0);
            value_mb_load_a.reactive_pwr.push(0);
            value_mb_load_a.pf.push(0);
            value_mb_load_a.hz.push(0);
        }

    } catch (err) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err);
    }
}, 100);


var dbsum_hour = new Date().getHours();
var dbsum_minute = new Date().getMinutes();
var dbsum_day = new Date().getDate();
var dbsum_month = new Date().getMonth();

// 1초 마다 db update 및 1분단위 데이터 처리
setInterval(function() {
    try {
        // 현재 minute가 변경되었다면?
        if (dbsum_minute != new Date().getMinutes()) {
            dbsum_minute = new Date().getMinutes(); //분 갱신
            // 15분단위 기록 
            /*
            if (get_bat_capa() < set.ESS_Total_Capacity * 1000 * 0.05)
                mode_charge();
            else if (get_bat_capa() < set.ESS_Total_Capacity * 1000 * 0.1)
                mode_idle();
            else mode_discharge();
            */



            if (moderun == 'Charging') { // 충전중일때
                if (get_bat_capa() > set.ESS_Total_Capacity * 1000 * 0.05) // 배터리 용량이 5%이상이라면
                    mode_idle(false); // 충전을 중지하고 스탠바이 모드로 변경한다.
            }

            if (moderun == 'Discharging') { // 방전중일 때
                if (get_bat_capa() < set.ESS_Total_Capacity * 1000 * 0.07) //  배터리 용량이 7% 이하라면
                    mode_idle(false); // 방전을 중지하고 스탠바이 모드로 변경한다.
            }

            if (moderun == 'Standby') { // 스탠바이 모드 일 때 
                if (get_bat_capa() > set.ESS_Total_Capacity * 1000 * 0.15) // 배터리 용량이 15% 이상이라면
                    mode_discharge(false); // 방전모드로 변경한다.
                else if (get_bat_capa() < set.ESS_Total_Capacity * 1000 * 0.02) // 배터리 용량이 2% 이하라면 충전을 개시한다.
                    mode_charge(false);
            }

            if (dbsum_minute % 15 == 0) {
                var tq = {
                    index: 0,
                    Time: 0,
                    datetime: 0,

                    // optisolar GS
                    Solar_input_voltage_1: 0,
                    Solar_input_voltage_2: 0,
                    Solar_input_current_1: 0,
                    Solar_input_current_2: 0,
                    Battery_voltage: 0,
                    Battery_capacity: 0,
                    Battery_current: 0,
                    Battery_power: 0,
                    AC_input_voltage_R: 0,
                    AC_input_frequency: 0,
                    AC_output_voltage_R: 0,
                    AC_output_frequency: 0,
                    Inner_temperature: 0,
                    External_battery_temperature: 0,

                    //optisolar ps
                    Solar_input_power1: 0,
                    Solar_input_power2: 0,
                    AC_output_active_power: 0,
                    AC_output_total_active_power: 0,
                    AC_output_apperent_power: 0,
                    AC_output_total_apperent_power: 0,
                    AC_output_power_percentage: 0,
                    AC_output_connect_status: 0,
                    Solar_input_1_work_status: 0,
                    Solar_input_2_work_status: 0,
                    Battery_power_direction: 0,
                    power_direction_DCAC: 0,
                    power_direction_line: 0,

                    // modbus grid powermeter (value_mb_grid)
                    pm_volt: 0,
                    pm_current: 0,
                    pm_active_pwr: 0,
                    pm_apparent_pwr: 0,
                    pm_reactive_pwr: 0,
                    pm_pf: 0,
                    pm_hz: 0,
                    pm_import_active_energy: 0,
                    pm_export_active_energy: 0,
                    pm_import_reactive_energy: 0,
                    pm_export_reactive_energy: 0,
                    pm_total_active_energy: 0,
                    pm_total_reactive_energy: 0,

                    //modbus load powermeter (value_mb_load)
                    ld_volt: 0,
                    ld_current: 0,
                    ld_active_pwr: 0,
                    ld_apparent_pwr: 0,
                    ld_reactive_pwr: 0,
                    ld_pf: 0,
                    ld_hz: 0,
                    ld_import_active_energy: 0,
                    ld_export_active_energy: 0,
                    ld_import_reactive_energy: 0,
                    ld_export_reactive_energy: 0,
                    ld_total_active_energy: 0,
                    ld_total_reactive_energy: 0,

                    check_day: meter.check_day,
                    grid_month_import_active_energy: meter.grid_month_import_active_energy,
                    grid_month_export_active_energy: meter.grid_month_export_active_energy,
                    grid_daily_import_active_energy: meter.grid_daily_import_active_energy,
                    grid_daily_export_active_energy: meter.grid_daily_export_active_energy,
                    load_month_import_active_energy: meter.load_month_import_active_energy,
                    load_month_export_active_energy: meter.load_month_export_active_energy,
                    load_daily_import_active_energy: meter.load_daily_import_active_energy,
                    load_daily_export_active_energy: meter.load_daily_export_active_energy //,
                };

                var d = new Date();
                //var index = d.getHours() * 4 + parseInt(d.getMinutes() / 15);
                tq.index = d.getHours() * 60 + d.getMinutes();

                if (value_gs_a.Alive < time_out && value_gs_a.Solar_input_voltage_1.length > 0) {
                    tq.Solar_input_voltage_1 = value_gs_q.Solar_input_voltage_1 = tof(value_gs_a.Solar_input_voltage_1.average());
                    tq.Solar_input_voltage_2 = value_gs_q.Solar_input_voltage_2 = tof(value_gs_a.Solar_input_voltage_2.average());
                    tq.Solar_input_current_1 = value_gs_q.Solar_input_current_1 = tof(value_gs_a.Solar_input_current_1.average());
                    tq.Solar_input_current_2 = value_gs_q.Solar_input_current_2 = tof(value_gs_a.Solar_input_current_2.average());
                    tq.Battery_voltage = value_gs_q.Battery_voltage = tof(value_gs.Battery_voltage);
                    //tq.Battery_capacity = value_gs_q.Battery_capacity = tof(value_gs_a.Battery_capacity.average());
                    var bc = 0;
                    //if (value_ps_a.Alive < time_out && value_ps.Battery_power_direction == 'charge') bc = value_gs_a.Battery_power.average();
                    //if (value_ps_a.Alive < time_out && value_ps.Battery_power_direction == 'donothing') bc = value_gs_a.Battery_power.average() - 120; // 시간당 120W씩 방전한다. (옵티 유지때문인 것으로 예상)
                    //if (value_ps_a.Alive < time_out && value_ps.Battery_power_direction == 'discharge') bc = value_gs_a.Battery_power.average();
                    bc = value_gs_a.Battery_power.average() - 0 /*55.1*/ ;
                    var bt = tofn(batcapa + (bc / 4), 2);
                    if (bt < 0) bt = 0;
                    if (bt > set.ESS_Total_Capacity * 1000) bt = set.ESS_Total_Capacity * 1000;
                    tq.Battery_capacity = value_gs_q.Battery_capacity = batcapa = bt;

                    //tq.Battery_capacity = value_gs_q.Battery_capacity = batcapa = tof( batcapa + value_gs_a.Battery_power.average() - 30); // 시간당 120W씩 방전한다. (옵티 유지때문인 것으로 예상)
                    tq.Battery_current = value_gs_q.Battery_current = tofn(value_gs_a.Battery_current.average(), 3);
                    tq.Battery_power = value_gs_q.Battery_power = tof(value_gs_a.Battery_power.average());
                    tq.AC_input_voltage_R = value_gs_q.AC_input_voltage_R = tof(value_gs_a.AC_input_voltage_R.average());
                    tq.AC_input_frequency = value_gs_q.AC_input_frequency = tof(value_gs_a.AC_input_frequency.average());
                    tq.AC_output_voltage_R = value_gs_q.AC_output_voltage_R = tof(value_gs_a.AC_output_voltage_R.average());
                    tq.AC_output_frequency = value_gs_q.AC_output_frequency = tof(value_gs_a.AC_output_frequency.average());
                    tq.Inner_temperature = value_gs_q.Inner_temperature = tof(value_gs_a.Inner_temperature.average());
                    tq.External_battery_temperature = value_gs_q.External_battery_temperature = tof(value_gs_a.External_battery_temperature.average());
                    value_gs_q.Alive = 0;
                }

                if (value_ps_a.Alive < time_out && value_ps_a.Solar_input_power1.length > 0) {
                    tq.Solar_input_power1 = value_ps_q.Solar_input_power1 = tof(value_ps_a.Solar_input_power1.average());
                    tq.Solar_input_power2 = value_ps_q.Solar_input_power2 = tof(value_ps_a.Solar_input_power2.average());
                    tq.AC_output_active_power = value_ps_q.AC_output_active_power = tof(value_ps_a.AC_output_active_power.average());
                    tq.AC_output_total_active_power = value_ps_q.AC_output_total_active_power = tof(value_ps_a.AC_output_total_active_power.average());
                    tq.AC_output_apperent_power = value_ps_q.AC_output_apperent_power = tof(value_ps_a.AC_output_apperent_power.average());
                    tq.AC_output_total_apperent_power = value_ps_q.AC_output_total_apperent_power = tof(value_ps_a.AC_output_total_apperent_power.average());
                    tq.AC_output_power_percentage = value_ps_q.AC_output_power_percentage = tof(value_ps_a.AC_output_power_percentage.average());
                    tq.AC_output_connect_status = value_ps_q.AC_output_connect_status = value_ps_a.AC_output_connect_status;
                    tq.Solar_input_1_work_status = value_ps_q.Solar_input_1_work_status = value_ps_a.Solar_input_1_work_status;
                    tq.Solar_input_2_work_status = value_ps_q.Solar_input_2_work_status = value_ps_a.Solar_input_2_work_status;
                    tq.Battery_power_direction = value_ps_q.Battery_power_direction = value_ps_a.Battery_power_direction;
                    tq.power_direction_DCAC = value_ps_q.power_direction_DCAC = value_ps_a.power_direction_DCAC;
                    tq.power_direction_line = value_ps_q.power_direction_line = value_ps_a.power_direction_line;
                    value_ps_q.Alive = 0;
                }

                if (value_mb_load_a.Alive < time_out && value_mb_load_a.volt.length > 0) {
                    tq.ld_volt = tof(value_mb_load_a.volt.average());
                    tq.ld_current = tofn(value_mb_load_a.current.average(), 3);
                    tq.ld_active_pwr = tof(value_mb_load_a.active_pwr.average());
                    tq.ld_apparent_pwr = tof(value_mb_load_a.apparent_pwr.average());
                    tq.ld_reactive_pwr = tof(value_mb_load_a.reactive_pwr.average());
                    tq.ld_pf = tofn(value_mb_load_a.pf.average(), 3);
                    tq.ld_hz = tof(value_mb_load_a.hz.average());
                    tq.ld_import_active_energy = tofn(value_mb_load_a.import_active_energy, 3);
                    tq.ld_export_active_energy = tofn(value_mb_load_a.export_active_energy, 3);
                    tq.ld_import_reactive_energy = tofn(value_mb_load_a.import_reactive_energy, 3);
                    tq.ld_export_reactive_energy = tofn(value_mb_load_a.export_reactive_energy, 3);
                    tq.ld_total_active_energy = tofn(value_mb_load_a.total_active_energy, 3);
                    tq.ld_total_reactive_energy = tofn(value_mb_load_a.total_reactive_energy, 3);
                }
                if (value_mb_grid_a.Alive < time_out && value_mb_grid_a.volt.length > 0) {
                    tq.pm_volt = tof(value_mb_grid_a.volt.average());
                    tq.pm_current = tofn(value_mb_grid_a.current.average(), 3);
                    tq.pm_active_pwr = tof(value_mb_grid_a.active_pwr.average());
                    tq.pm_apparent_pwr = tof(value_mb_grid_a.apparent_pwr.average());
                    tq.pm_reactive_pwr = tof(value_mb_grid_a.reactive_pwr.average());
                    tq.pm_pf = tofn(value_mb_grid_a.pf.average(), 3);
                    tq.pm_hz = tof(value_mb_grid_a.hz.average());
                    tq.pm_import_active_energy = tofn(value_mb_grid_a.import_active_energy, 3);
                    tq.pm_export_active_energy = tofn(value_mb_grid_a.export_active_energy, 3);
                    tq.pm_import_reactive_energy = tofn(value_mb_grid_a.import_reactive_energy, 3);
                    tq.pm_export_reactive_energy = tofn(value_mb_grid_a.export_reactive_energy, 3);
                    tq.pm_total_active_energy = tofn(value_mb_grid_a.total_active_energy, 3);
                    tq.pm_total_reactive_energy = tofn(value_mb_grid_a.total_reactive_energy, 3);
                }

                console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "15M interval" + "GS:" + value_gs_a.Solar_input_voltage_1.length + " / PS:" + value_ps_a.Solar_input_power1.length + " / MBG:" + value_mb_grid_a.volt.length + " / MBL:" + value_mb_load_a.volt.length + " AVG.");

                //누적된 배열들을 초기화한다.
                value_gs_a.Solar_input_voltage_1 = [];
                value_gs_a.Solar_input_voltage_2 = [];
                value_gs_a.Solar_input_current_1 = [];
                value_gs_a.Solar_input_current_2 = [];
                value_gs_a.Battery_voltage = [];
                value_gs_a.Battery_capacity = [];
                value_gs_a.Battery_current = [];
                value_gs_a.Battery_power = [];
                value_gs_a.AC_input_voltage_R = [];
                value_gs_a.AC_input_frequency = [];
                value_gs_a.AC_output_voltage_R = [];
                value_gs_a.AC_output_frequency = [];
                value_gs_a.Inner_temperature = [];
                value_gs_a.External_battery_temperature = [];

                value_ps_a.Solar_input_power1 = [];
                value_ps_a.Solar_input_power2 = [];
                value_ps_a.AC_output_active_power = [];
                value_ps_a.AC_output_total_active_power = [];
                value_ps_a.AC_output_apperent_power = [];
                value_ps_a.AC_output_total_apperent_power = [];
                value_ps_a.AC_output_power_percentage = [];



                value_mb_grid_a.volt = [];
                value_mb_grid_a.current = [];
                value_mb_grid_a.active_pwr = [];
                value_mb_grid_a.apparent_pwr = [];
                value_mb_grid_a.reactive_pwr = [];
                value_mb_grid_a.pf = [];
                value_mb_grid_a.hz = [];
                // 15분전 데이터를 지금 갱신한다.
                value_mb_grid_a.past_import_active_energy = value_mb_grid_a.import_active_energy;
                value_mb_grid_a.past_export_active_energy = value_mb_grid_a.export_active_energy;
                value_mb_grid_a.past_import_reactive_energy = value_mb_grid_a.import_reactive_energy;
                value_mb_grid_a.past_export_reactive_energy = value_mb_grid_a.export_reactive_energy;
                value_mb_grid_a.past_total_active_energy = value_mb_grid_a.total_active_energy;
                value_mb_grid_a.past_total_reactive_energy = value_mb_grid_a.total_reactive_energy;
                value_mb_grid_a.Alive = 99;
                value_mb_grid_a.cnt = 0;

                value_mb_load_a.volt = [];
                value_mb_load_a.current = [];
                value_mb_load_a.active_pwr = [];
                value_mb_load_a.apparent_pwr = [];
                value_mb_load_a.reactive_pwr = [];
                value_mb_load_a.pf = [];
                value_mb_load_a.hz = [];
                // 15분전 데이터를 지금 갱신한다.
                value_mb_load_a.past_import_active_energy = value_mb_load_a.import_active_energy;
                value_mb_load_a.past_export_active_energy = value_mb_load_a.export_active_energy;
                value_mb_load_a.past_import_reactive_energy = value_mb_load_a.import_reactive_energy;
                value_mb_load_a.past_export_reactive_energy = value_mb_load_a.export_reactive_energy;
                value_mb_load_a.past_total_active_energy = value_mb_load_a.total_active_energy;
                value_mb_load_a.past_total_reactive_energy = value_mb_load_a.total_reactive_energy;
                value_mb_load_a.Alive = 99;
                value_mb_load_a.cnt = 0;
                //value_gs_a = cloneobj(value_gs_z);
                //value_ps_a = cloneobj(value_ps_z);
                //value_mb_a = cloneobj(value_mb_z);

                //var ph1load = tq.ph1_power + (tq.Solar_input_power_1 / 3) - (bat_pwr / 3);
                var t1 = moment(); // 조회할 테이블 시작 시간
                tq.Time = t1.format('YYYY-MM-DD HH:mm:ss');
                tq.datetime = new Date(t1.toISOString());
                //                console.log(tq + "를 기록한다.");
                mdb.collection("sum_q").insertOne(tq, function(err, res) {
                    if (err) console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err);
                });
                mdb.collection('stat').update({ "Name": "BAT" }, { $set: { "Bat_Capa": batcapa } });

            } //             //15분단위 end
        } // 현재 minute가 변경되었다면? end

        // 시간이 변경되었을 때라면?
        if (dbsum_hour != new Date().getHours()) {
            dbsum_hour = new Date().getHours(); //시간 갱신

        } // 시간 변경되었을 때 end

        // 날짜가 변경되었을 때라면?
        //if (dbsum_minute % 1 == 0) {
        if (dbsum_day != new Date().getDate()) {
            dbsum_day = new Date().getDate(); //날짜 갱신

            record_day();

            if (meter.check_day == dbsum_day) // 만약이 오늘이 검침일이라면?
            {
                meter.grid_month_import_active_energy = value_mb_grid_a.import_active_energy;
                meter.grid_month_export_active_energy = value_mb_grid_a.export_active_energy;

                meter.load_month_import_active_energy = value_mb_load_a.import_active_energy;
                meter.load_month_export_active_energy = value_mb_load_a.export_active_energy;
                meter.solar_month_energy = 0;
            }
            meter.grid_daily_import_active_energy = value_mb_grid.import_active_energy;
            meter.grid_daily_export_active_energy = value_mb_grid.export_active_energy;

            meter.load_daily_import_active_energy = value_mb_load.import_active_energy;
            meter.load_daily_export_active_energy = value_mb_load.export_active_energy;
            meter.solar_month_energy += (resq.Solar_input_power1.sum() + resq.Solar_input_power2.sum()) / 4000;
            mdb.collection('stat').update({ "Name": "BAT" }, { $set: meter });


        } // 날짜 변경되었을 때 end

    } catch (err) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err);
    }
}, 1000);

function record_day()
//function record_day(ddd)
{
    var td = {
        Time: 0,
        datetime: 0,

        // optisolar GS
        Solar_input_voltage_1: 0,
        Solar_input_voltage_2: 0,
        Solar_input_current_1: 0,
        Solar_input_current_2: 0,
        Battery_voltage: 0,
        Battery_capacity: 0,
        Battery_current: 0,
        Battery_power: 0,
        AC_input_voltage_R: 0,
        AC_input_frequency: 0,
        AC_output_voltage_R: 0,
        AC_output_frequency: 0,
        Inner_temperature: 0,
        External_battery_temperature: 0,

        //optisolar ps
        Solar_input_power1: 0,
        Solar_input_power2: 0,
        AC_output_active_power: 0,
        AC_output_total_active_power: 0,
        AC_output_apperent_power: 0,
        AC_output_total_apperent_power: 0,
        AC_output_power_percentage: 0,
        AC_output_connect_status: 0,
        Solar_input_1_work_status: 0,
        Solar_input_2_work_status: 0,
        Battery_power_direction: 0,
        power_direction_DCAC: 0,
        power_direction_line: 0,

        // modbus grid powermeter (value_mb_grid)
        pm_volt: 0,
        pm_current: 0,
        pm_active_pwr: 0,
        pm_apparent_pwr: 0,
        pm_reactive_pwr: 0,
        pm_pf: 0,
        pm_hz: 0,
        pm_import_active_energy: 0,
        pm_export_active_energy: 0,
        pm_import_reactive_energy: 0,
        pm_export_reactive_energy: 0,
        pm_total_active_energy: 0,
        pm_total_reactive_energy: 0,

        //modbus load powermeter (value_mb_load)
        ld_volt: 0,
        ld_current: 0,
        ld_active_pwr: 0,
        ld_apparent_pwr: 0,
        ld_reactive_pwr: 0,
        ld_pf: 0,
        ld_hz: 0,
        ld_import_active_energy: 0,
        ld_export_active_energy: 0,
        ld_import_reactive_energy: 0,
        ld_export_reactive_energy: 0,
        ld_total_active_energy: 0,
        ld_total_reactive_energy: 0,

        check_day: meter.check_day,
        grid_month_import_active_energy: meter.grid_month_import_active_energy,
        grid_month_export_active_energy: meter.grid_month_export_active_energy,
        grid_daily_import_active_energy: meter.grid_daily_import_active_energy,
        grid_daily_export_active_energy: meter.grid_daily_export_active_energy,
        load_month_import_active_energy: meter.load_month_import_active_energy,
        load_month_export_active_energy: meter.load_month_export_active_energy,
        load_daily_import_active_energy: meter.load_daily_import_active_energy,
        load_daily_export_active_energy: meter.load_daily_export_active_energy
    };

    var t0 = moment(); // 조회할 테이블 시작 시간
    //var t0 = moment(ddd); // 조회할 테이블 시작 시간
    var t2 = t0.clone().add(-1, 'day'); // 시작시간에서 1일 전의 시간

    var td0 = new Date(t0.format("YYYY MM DD"));
    var td2 = new Date(t2.format("YYYY MM DD"));

    //var qr = { "datetime": { $gte: new Date(t2.format()), $lt: new Date(t0.format()) } };
    var qr = {
        "datetime": {
            $gte: new Date(td2.getFullYear(), td2.getMonth(), td2.getDate(), 0, 5),
            $lt: new Date(td0.getFullYear(), td0.getMonth(), td0.getDate(), 0, 5),
        }
    };

    td.Time = t2.format('YYYY-MM-DD HH:mm:ss');
    td.datetime = new Date(t0.toISOString());
    //console.log(qr);
    mdb.collection('sum_q').find(qr).toArray(function(err, result) {
        if (err) console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err); //throw err;
        console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "" + "sum_q의 금일 갯수는" + result.length);
        if (result.length > 0) {
            result.forEach(function(el, idx, arr) {
                td.Solar_input_voltage_1 += Number(el.Solar_input_voltage_1);
                td.Solar_input_voltage_2 += Number(el.Solar_input_voltage_2);
                td.Solar_input_current_1 += Number(el.Solar_input_current_1);
                td.Solar_input_current_2 += Number(el.Solar_input_current_2);
                td.Battery_voltage += Number(el.Battery_voltage);
                td.Battery_capacity = tof(get_bat_capa());
                td.Battery_current += Number(el.Battery_current);
                td.Battery_power += Number(el.Battery_power);
                td.AC_input_voltage_R += Number(el.AC_input_voltage_R);
                td.AC_input_frequency += Number(el.AC_input_frequency);
                td.AC_output_voltage_R += Number(el.AC_output_voltage_R);
                td.AC_output_frequency += Number(el.AC_output_frequency);
                td.Inner_temperature += Number(el.Inner_temperature);
                td.External_battery_temperature += Number(el.External_battery_temperature);
                td.Solar_input_power1 += Number(el.Solar_input_power1);
                td.Solar_input_power2 += Number(el.Solar_input_power2);
                td.AC_output_active_power += Number(el.AC_output_active_power);
                td.AC_output_total_active_power += Number(el.AC_output_total_active_power);
                td.AC_output_apperent_power += Number(el.AC_output_apperent_power);
                td.AC_output_total_apperent_power += Number(el.AC_output_total_apperent_power);
                td.AC_output_power_percentage += Number(el.AC_output_power_percentage);
                td.AC_output_connect_status = el.AC_output_connect_status;
                td.Solar_input_1_work_status = el.Solar_input_1_work_status;
                td.Solar_input_2_work_status = el.Solar_input_2_work_status;
                td.Battery_power_direction = el.Battery_power_direction;
                td.power_direction_DCAC = el.power_direction_DCAC;
                td.power_direction_line = el.power_direction_line;

                td.pm_volt += Number(el.pm_volt);
                td.pm_current += Number(el.pm_current);
                // 일반계량기가 거꾸로 돌아가지 않으므로 export한 값은 그냥 마이너스 시키지 않는다.
                if (Number(el.pm_active_pwr) > 0) td.pm_active_pwr += Number(el.pm_active_pwr);
                td.pm_apparent_pwr += Number(el.pm_apparent_pwr);
                td.pm_reactive_pwr += Number(el.pm_reactive_pwr);
                td.pm_pf += Number(el.pm_pf);
                td.pm_hz += Number(el.pm_hz);
                td.pm_import_active_energy = Number(el.pm_import_active_energy);
                td.pm_export_active_energy = Number(el.pm_export_active_energy);
                td.pm_import_reactive_energy = Number(el.pm_import_reactive_energy);
                td.pm_export_reactive_energy = Number(el.pm_export_reactive_energy);
                td.pm_total_active_energy = Number(el.pm_total_active_energy);
                td.pm_total_reactive_energy = Number(el.pm_total_reactive_energy);

                //modbus load powermeter (value_mb_load)
                td.ld_volt += Number(el.ld_volt);
                td.ld_current += Number(el.ld_current);
                td.ld_active_pwr += Number(el.ld_active_pwr);
                td.ld_apparent_pwr += Number(el.ld_apparent_pwr);
                td.ld_reactive_pwr += Number(el.ld_reactive_pwr);
                td.ld_pf += Number(el.ld_pf);
                td.ld_hz += Number(el.ld_hz);
                td.ld_import_active_energy = Number(el.ld_import_active_energy);
                td.ld_export_active_energy = Number(el.ld_export_active_energy);
                td.ld_import_reactive_energy = Number(el.ld_import_reactive_energy);
                td.ld_export_reactive_energy = Number(el.ld_export_reactive_energy);
                td.ld_total_active_energy = Number(el.ld_total_active_energy);
                td.ld_total_reactive_energy = Number(el.ld_total_reactive_energy);
            });
            td.Solar_input_voltage_1 = tof(td.Solar_input_voltage_1 / result.length);
            td.Solar_input_voltage_2 = tof(td.Solar_input_voltage_2 / result.length);
            td.Solar_input_current_1 = tofn(td.Solar_input_current_1 / result.length, 3);
            td.Solar_input_current_2 = tofn(td.Solar_input_current_2 / result.length, 3);
            td.Battery_voltage = tof(td.Battery_voltage / result.length);
            td.Battery_current = tofn(td.Battery_current / result.length, 3);
            td.Battery_power = tof(td.Battery_power / result.length);
            td.AC_input_voltage_R = tof(td.AC_input_voltage_R / result.length);
            td.AC_input_frequency = tof(td.AC_input_frequency / result.length);
            td.AC_output_voltage_R = tof(td.AC_output_voltage_R / result.length);
            td.AC_output_frequency = tof(td.AC_output_frequency / result.length);
            td.Inner_temperature = tof(td.Inner_temperature / result.length);
            td.External_battery_temperature = tof(td.External_battery_temperature / result.length);
            td.Solar_input_power1 = tof(td.Solar_input_power1 / result.length);
            td.Solar_input_power2 = tof(td.Solar_input_power2 / result.length);
            td.AC_output_active_power = tof(td.AC_output_active_power / result.length);
            td.AC_output_total_active_power = tof(td.AC_output_total_active_power / result.length);
            td.AC_output_apperent_power = tof(td.AC_output_apperent_power / result.length);
            td.AC_output_total_apperent_power = tof(td.AC_output_total_apperent_power / result.length);
            td.AC_output_power_percentage = tof(td.AC_output_power_percentage / result.length);

            td.pm_volt = tof(td.pm_volt / result.length);
            td.pm_current = tofn(td.pm_current / result.length, 3);
            td.pm_active_pwr = tof(td.pm_active_pwr / result.length);
            td.pm_apparent_pwr = tof(td.pm_apparent_pwr / result.length);
            td.pm_reactive_pwr = tof(td.pm_reactive_pwr / result.length);
            td.pm_pf = tofn(td.pm_pf / result.length, 3);
            td.pm_hz = tof(td.pm_hz / result.length);

            td.ld_volt = tof(td.ld_volt / result.length);
            td.ld_current = tofn(td.ld_current / result.length, 3);
            td.ld_active_pwr = tof(td.ld_active_pwr / result.length);
            td.ld_apparent_pwr = tof(td.ld_apparent_pwr / result.length);
            td.ld_reactive_pwr = tof(td.ld_reactive_pwr / result.length);
            td.ld_pf = tofn(td.ld_pf / result.length, 3);
            td.ld_hz = tof(td.ld_hz / result.length);

            mdb.collection("sum_d").insertOne(td, function(err, res) {
                console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + "" + "sum_d 기록을 시작한다.");
                if (err) console.log(moment().format('YYYY-MM-DD HH:mm:ss / ') + err);
            });

        } else;
    });
}


// 고정폭 길이의 숫자 문자열을 만든다. 고정폭은 3
function zerofil(val) {
    return ('000' + Number(val)).substr(-3);
}
// 고정폭 길이의 숫자 문자열을 만든다. 고정폭은 2
function zerofil2(val) {
    return ('00' + Number(val)).substr(-2);
}
// 고정폭 길이의 숫자 문자열을 만든다. 고정폭은 6
function zerofil4(val) {
    return ('0000' + Number(val)).substr(-4);
}
// 고정폭 길이의 숫자 문자열을 만든다. 고정폭은 6
function zerofil6(val) {
    return ('000000' + Number(val)).substr(-6);
}

/*
// checksum 정수 반환
function checksum(str) {
    var i;
    var chk = 0;
    for (i = 0; i < str.length; i++) {
        chk += str.charCodeAt(i);
    }
    return chk & 0xff;
}


function cloneobj(obj) {
    if (obj === null || typeof(obj) !== 'object')
        return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
}
*/

Array.prototype.sum = Array.prototype.sum || function() {
    return this.reduce(function(sum, a) { return sum + Number(a); }, 0);
};

Array.prototype.average = Array.prototype.average || function() {
    return this.sum() / (this.length || 1);
};

function tof(num) {
    return Number(num.toFixed(1));
}

function tofn(num, j) {
    return Number(num.toFixed(j));
}

function get_bat_capa() {
    //var bc = 0;
    //var d = new Date();

    if (value_ps_a.Alive < time_out && value_gs_a.Alive < time_out) {
        /*
        if (value_ps.Battery_power_direction == 'charge')
            bc = (value_gs_a.Battery_power.average()) * (((d.getMinutes() * 60 + d.getSeconds()) % 900) / 900);
        else if (value_ps.Battery_power_direction == 'donothing')
            bc = (value_gs_a.Battery_power.average() - 120) * (((d.getMinutes() * 60 + d.getSeconds()) % 900) / 900);
        else if (value_ps.Battery_power_direction == 'discharge')
            bc = (value_gs_a.Battery_power.average()) * (((d.getMinutes() * 60 + d.getSeconds()) % 900) / 900);
            */
        //bc = (value_gs_a.Battery_power.average() - 0 /*55.1*/ ) * (((d.getMinutes() * 60 + d.getSeconds()) % 900) / 900);
    }

    //bc = batcapa + (bc / 4);
    //if (bc < 0) bc = 0;
    //if (bc > set.ESS_Total_Capacity * 1000) bc = set.ESS_Total_Capacity * 1000;
    return (value_bms1.Residual_capacity + value_bms2.Residual_capacity) * 50;

    //return bc;
}