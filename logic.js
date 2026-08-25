// --- THUẬT TOÁN LỊCH PHÁP THIÊN VĂN ---



function INT(d) { return Math.floor(d); }



function getJulianDayNumber(dd, mm, yy) { 

    const a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3; 

    let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045; 

    if (jd < 2299161) { jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083; } 

    return jd; 

}



function jdnToGregorian(jdn) { 

    let j = jdn + 32044; let g = INT(j / 146097); let dg = j % 146097; 

    let c = INT((INT(dg / 36524) + 1) * 3 / 4); let dc = dg - c * 36524; 

    let b = INT(dc / 1461); let db = dc % 1461; 

    let a = INT((INT(db / 365) + 1) * 3 / 4); let da = db - a * 365; 

    let y = g * 400 + c * 100 + b * 4 + a; let m = INT((da * 5 + 308) / 153) - 2; 

    let d = da - INT((m + 4) * 153 / 5) + 122; 

    let year = y - 4800 + INT((m + 2) / 12); let month = (m + 2) % 12 + 1; let day = d + 1; 

    return { year, month, day }; 

}



function getNewMoonDay(k) { 

    const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = Math.PI / 180; 

    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr); 

    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3; 

    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3; 

    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3; 

    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M) - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr) - 0.0004 * Math.sin(dr * 3 * Mpr) + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr)) - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M)) - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr)) + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M)); 

    let deltat = (T < -11) ? (0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3) : (-0.000278 + 0.000265 * T + 0.000262 * T2); 

    return INT(Jd1 + C1 - deltat + 0.5 + TIME_ZONE / 24); 

}



function getSunLongitude(jdn) { 

    const T = (jdn - 2451545.5 - TIME_ZONE / 24) / 36525, T2 = T * T, dr = Math.PI / 180; 

    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2; 

    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2; 

    const DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M); 

    let L = L0 + DL; while (L < 0) L += 360; while (L >= 360) L -= 360; 

    return L; 

}



function getTietKhi(jdn) { return TIET_KHI[INT(getSunLongitude(jdn) / 15) % 24]; }



function getLunarMonth11(yy) { 

    let nm = getNewMoonDay(INT((getJulianDayNumber(31, 12, yy) - 2415021) / 29.530588853)); 

    const sunLong = INT(getSunLongitude(nm) / 30); 

    if (sunLong >= 9) { nm = getNewMoonDay(INT((getJulianDayNumber(31, 12, yy) - 2415021) / 29.530588853) - 1); } 

    return nm; 

}



function getLeapMonthOffset(a11) { 

    const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5); 

    let last = 0, i = 1, arc; 

    do { last = INT(getSunLongitude(getNewMoonDay(k + i)) / 30); i++; arc = INT(getSunLongitude(getNewMoonDay(k + i)) / 30); } while (arc != last && i < 14); 

    return i - 1; 

}



function convertSolarToLunar(solarDay, solarMonth, solarYear, hour) { 

    let jdToUse = getJulianDayNumber(solarDay, solarMonth, solarYear); 

    if (hour >= 23) { jdToUse += 1; } 

    const k = INT((jdToUse - 2415021.076998695) / 29.530588853); 

    let monthStart = getNewMoonDay(k + 1); 

    if (monthStart > jdToUse) { monthStart = getNewMoonDay(k); } 

    let a11 = getLunarMonth11(solarYear), b11 = a11, lunarYear, lunarMonth; 

    if (a11 >= monthStart) { lunarYear = solarYear; a11 = getLunarMonth11(solarYear - 1); } 

    else { lunarYear = solarYear + 1; b11 = getLunarMonth11(solarYear + 1); } 

    const lunarDay = jdToUse - monthStart + 1; const diff = INT((monthStart - a11) / 29); 

    let lunarLeap = 0; lunarMonth = diff + 11; 

    if (b11 - a11 > 365) { 

        const leapMonthDiff = getLeapMonthOffset(a11); 

        if (diff >= leapMonthDiff) { lunarMonth = diff + 10; if (diff == leapMonthDiff) { lunarLeap = 1; } } 

    } 

    if (lunarMonth > 12) { lunarMonth -= 12; } 

    if (lunarMonth >= 11 && diff < 4) { lunarYear -= 1; } 

    return [lunarYear, lunarMonth, lunarDay, lunarLeap]; 

}



function getDateInfo(jdn) { 

    const { year, month, day } = jdnToGregorian(jdn); 

    const [lunarYear, lunarMonth, lunarDay, lunarLeap] = convertSolarToLunar(day, month, year, 12); 

    const tietKhi = getTietKhi(jdn); 

    const canNgay = (jdn + 9) % 10; const chiNgay = (jdn + 1) % 12; 

    return { 

        jdn: jdn, solarDay: day, solarMonth: month, solarYear: year, 

        lunarDay: lunarDay, lunarMonth: lunarMonth, lunarYear: lunarYear, lunarLeap: lunarLeap, 

        dayCanChi: THIEN_CAN[canNgay] + " " + DIA_CHI[chiNgay], 

        monthCanChi: THIEN_CAN[(lunarYear * 12 + lunarMonth + 3) % 10] + " " + DIA_CHI[(lunarMonth + 1) % 12], 

        yearCanChi: THIEN_CAN[(lunarYear + 6) % 10] + " " + DIA_CHI[(lunarYear + 8) % 12], 

        tietKhi: tietKhi 

    }; 

}



// ✅ ĐÃ TỐI ƯU: Sử dụng công thức toán học thay vì switch case

function getHourCanChi(dayCan, hour) { 

    const canNgayIndex = THIEN_CAN.indexOf(dayCan); 

    const canGioTyDauIndex = (canNgayIndex % 5) * 2; 

    const chiGioIndex = CHI_TO_INDEX[HOUR_TO_CHI[hour]]; 

    const canGioIndex = (canGioTyDauIndex + chiGioIndex) % 10; 

    return THIEN_CAN[canGioIndex] + " " + DIA_CHI[chiGioIndex]; 

}



function getLunarNewYearJDN(lunarYear) { 

    const a11 = getLunarMonth11(lunarYear - 1); 

    const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5); 

    return getNewMoonDay(k + 2); 

}



function calculateEquationOfTime(jdn) { 

    const n = jdn - 2451545.0; 

    const L = (280.46061837 + 0.98564736629 * n) % 360; 

    const g = (357.52911 + 0.98560028 * n) % 360; 

    const L_rad = Math.PI / 180; const g_rad = g * Math.PI / 180; 

    const lambda = L + 1.914602 * Math.sin(g_rad) + 0.019993 * Math.sin(2 * g_rad) + 0.000289 * Math.sin(3 * g_rad); 

    const obliq = (23.439291 - 0.00000036 * n) * Math.PI / 180; 

    const alpha = Math.atan2(Math.cos(obliq) * Math.sin(lambda * Math.PI / 180), Math.cos(lambda * Math.PI / 180)); 

    let eot_minutes = 4 * ((L * Math.PI / 180 - alpha) * 180 / Math.PI); 

    if (eot_minutes > 20) eot_minutes -= 1440; if (eot_minutes < -20) eot_minutes += 1440; 

    return eot_minutes; 

}



const lapXuanCache = {};

function getLapXuanJDN(year) { 

    if (lapXuanCache[year]) return lapXuanCache[year]; 

    let jdn = getJulianDayNumber(20, 1, year); 

    for (let i = 0; i < 30; i++) { 

        if (getTietKhi(jdn + i) === 'Lập xuân') { 

            const lapXuanJdn = jdn + i; lapXuanCache[year] = lapXuanJdn; return lapXuanJdn; 

        } 

    } 

    return getJulianDayNumber(4, 2, year); 

}



let longitudeCache = null; let lastLocationName = '';



// ✅ ĐÃ SỬA: Bổ sung AbortController timeout 5 giây chống treo

async function getSolarNoon(jdn, locationName) {

    if (!locationName) return "N/A";

    if (locationName !== lastLocationName) { longitudeCache = null; lastLocationName = locationName; }

    

    if (longitudeCache === null) {

        const controller = new AbortController();

        const timeoutId = setTimeout(() => controller.abort(), 5000);

        

        try {

            if (typeof fetch === 'undefined') { longitudeCache = 105.8; } 

            else {

                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`, { signal: controller.signal });

                const geoData = await geoResponse.json();

                if (!geoData || geoData.length === 0) { longitudeCache = 'error'; return "N/A (Lỗi vị trí)"; }

                longitudeCache = parseFloat(geoData[0].lon);

            }

        } catch (error) { 

            longitudeCache = 'error'; return "N/A (Lỗi API hoặc Timeout)"; 

        } finally {

            clearTimeout(timeoutId);

        }

    }

    

    if (longitudeCache === 'error') return "N/A (Lỗi)";

    const eotMinutes = calculateEquationOfTime(jdn);

    const solarNoonDecimalHours = 12 - (longitudeCache / 15) - (eotMinutes / 60) + TIME_ZONE;

    const hours = Math.floor(solarNoonDecimalHours);

    const minutes = Math.round((solarNoonDecimalHours - hours) * 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

}



function getYearCanChiInfo(year) { 

    if (!year || isNaN(year)) return { canChi: 'N/A', lacThuNapAm: 'N/A', lucThapNapAm: 'N/A' }; 

    const canChi = THIEN_CAN[(year + 6) % 10] + " " + DIA_CHI[(year + 8) % 12]; 

    return { canChi, lacThuNapAm: LAC_THU_NAP_AM_MAP[canChi] || "N/A", lucThapNapAm: LUC_THAP_NAP_AM_MAP[canChi] || "N/A" }; 

}

function getTietKhiMonth(tietKhi) { return TIET_KHI_MONTH_MAP[tietKhi] || 'N/A'; }



// --- LOGIC PHONG THỦY, THẦN SÁT & HKĐQ ---



function normalizeStar(number) {

    return ((number - 1) % 9 + 9) % 9 + 1;

}



function getStarPositions(centralStar) {

    const positions = {};

    const path = [ {p: 5, s: 0}, {p: 6, s: 1}, {p: 7, s: 2}, {p: 8, s: 3}, {p: 9, s: 4}, {p: 1, s: 5}, {p: 2, s: 6}, {p: 3, s: 7}, {p: 4, s: 8} ];

    path.forEach(item => { positions[normalizeStar(centralStar + item.s)] = palaces[item.p]; });

    return positions;

}



// ✅ ĐÃ SỬA BUG LOGIC: Dùng normalizeStar để chặn lỗi sinh ra sao số 10

function getAnnualCentralStar(year) {

    const sumOfDigits = year.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);

    let remainder = sumOfDigits % 9; 

    if (remainder === 0) remainder = 9;

    return normalizeStar(11 - remainder);

}



function getMonthlyStartStar(year) {

    const yearChiIndex = (year - 4 + 12) % 12; const chi = chiNames[yearChiIndex];

    if (['Dần', 'Thân', 'Tị', 'Hợi'].includes(chi)) return 2;

    if (['Thìn', 'Tuất', 'Sửu', 'Mùi'].includes(chi)) return 5;

    if (['Tý', 'Ngọ', 'Mão', 'Dậu'].includes(chi)) return 8;

    return 0;

}



function calculateAllYearlySats(year) {

    if (isNaN(year) || year < 1900) return null;

    const yearChi = chiNames[(year - 4 + 12) % 12];

    const annualCentralStar = getAnnualCentralStar(year);

    const annualPositions = getStarPositions(annualCentralStar);

    const yearSats = satsData[yearChi];

    const monthlyStartStar = getMonthlyStartStar(year);

    const monthlyStars = {};

    for (let month = 1; month <= 12; month++) {

        let monthlyCentralStar = monthlyStartStar - (month - 1);

        while (monthlyCentralStar < 1) { monthlyCentralStar += 9; }

        const monthlyPositions = getStarPositions(monthlyCentralStar);

        monthlyStars[month] = { nguHoang: monthlyPositions[5], nhiHac: monthlyPositions[2] };

    }

    return { year: year, yearChi: yearChi, nguHoangNam: annualPositions[5], nhiHacNam: annualPositions[2], thaiTue: yearSats.thaiTue, tuePha: yearSats.tuePha, monthlyStars: monthlyStars };

}



function getDetailedTamSatInfo(yearChi) {

    const tamHopGroup = Object.keys(TAM_SAT_YEAR_BASED_MAP).find(key => TAM_SAT_YEAR_BASED_MAP[key].includes(yearChi) || key === yearChi);

    if (!tamHopGroup) return 'N/A';

    let kiepSat, taiSat, tueSat;

    if (['Dần', 'Ngọ', 'Tuất'].includes(tamHopGroup)) { [kiepSat, taiSat, tueSat] = ['Hợi', 'Tý', 'Sửu']; } 

    else if (['Thân', 'Tý', 'Thìn'].includes(tamHopGroup)) { [kiepSat, taiSat, tueSat] = ['Tị', 'Ngọ', 'Mùi']; } 

    else if (['Tị', 'Dậu', 'Sửu'].includes(tamHopGroup)) { [kiepSat, taiSat, tueSat] = ['Dần', 'Mão', 'Thìn']; } 

    else if (['Hợi', 'Mão', 'Mùi'].includes(tamHopGroup)) { [kiepSat, taiSat, tueSat] = ['Thân', 'Dậu', 'Tuất']; }

    else { return 'N/A'; }

    const formatSat = (label, chi) => `${label}: ${CHI_TO_SONG_SON_MAP[chi] || ''}`;

    return `${formatSat('Kiếp Sát', kiepSat)}, ${formatSat('Tai Sát', taiSat)}, ${formatSat('Tuế Sát', tueSat)}`;

}



function getTamSatSonsForYear(yearChi) {

    const tamHopGroup = Object.keys(TAM_SAT_YEAR_BASED_MAP).find(key => TAM_SAT_YEAR_BASED_MAP[key].includes(yearChi) || key === yearChi);

    if (!tamHopGroup) return [];

    let satChis = [];

    if (['Dần', 'Ngọ', 'Tuất'].includes(tamHopGroup)) { satChis = ['Hợi', 'Tý', 'Sửu']; } 

    else if (['Thân', 'Tý', 'Thìn'].includes(tamHopGroup)) { satChis = ['Tị', 'Ngọ', 'Mùi']; } 

    else if (['Tị', 'Dậu', 'Sửu'].includes(tamHopGroup)) { satChis = ['Dần', 'Mão', 'Thìn']; } 

    else if (['Hợi', 'Mão', 'Mùi'].includes(tamHopGroup)) { satChis = ['Thân', 'Dậu', 'Tuất']; }

    else { return []; }

    const allSons = new Set();

    satChis.forEach(chi => {

        const songSonStr = CHI_TO_SONG_SON_MAP[chi];

        if (songSonStr) { songSonStr.split(' - ').forEach(son => allSons.add(son)); }

    });

    return [...allSons];

}



function timThongTinQue(tenQue) { return HKDQ_DATABASE[tenQue] || []; }



function phatHienThatTinhDaKiep(ketQuaCacTru) {

    const cacCapThatTinh = [];

    const danhSachTru = Object.entries(ketQuaCacTru).filter(([_, data]) => data.tenQue).map(([tenTru, data]) => ({ tenTru, tenQue: data.tenQue }));

    for (let i = 0; i < danhSachTru.length; i++) {

        for (let j = i + 1; j < danhSachTru.length; j++) {

            const tru1 = danhSachTru[i]; const tru2 = danhSachTru[j];

            if (HKDQ_MAP_THAT_TINH[tru1.tenQue] && HKDQ_MAP_THAT_TINH[tru1.tenQue].includes(tru2.tenQue)) {

                cacCapThatTinh.push({ tru1: tru1.tenTru, que1: tru1.tenQue, tru2: tru2.tenTru, que2: tru2.tenQue });

            }

        }

    }

    return cacCapThatTinh;

}



function phanTichHuynhDe(ketQuaCacTru) {

    const giaDinhTuTuc = {}; const danhSachHuynhDe = [];

    Object.values(ketQuaCacTru).forEach(tru => {

        if (tru.thongTinDuocChon && tru.thongTinDuocChon.vaiTroTongQuat === 'Tử Tức') {

            const giaDinh = tru.thongTinDuocChon.giaDinh;

            if (!giaDinhTuTuc[giaDinh]) { giaDinhTuTuc[giaDinh] = []; }

            giaDinhTuTuc[giaDinh].push(tru);

        }

    });

    let tongHuynhDe = 0;

    Object.values(giaDinhTuTuc).forEach(danhSach => {

        if (danhSach.length >= 2) {

            tongHuynhDe += danhSach.length;

            danhSachHuynhDe.push({ giaDinh: danhSach[0].thongTinDuocChon.giaDinh, soLuong: danhSach.length });

        }

    });

    return { tongHuynhDe, chiTiet: danhSachHuynhDe.map(hd => `${hd.giaDinh}: ${hd.soLuong} quẻ`).join(', ') };

}



// --- THUẬT TOÁN LOGIC QUÉT VÀ ĐÁNH GIÁ 2 BƯỚC ---



// BƯỚC 1: Hàm đánh giá tối ưu cho từng quẻ

function xetVaiTroToiUu(tenQue, cacGiaDinhPhuMau, cacGiaDinhHuynhDe) {

    const thongTinList = timThongTinQue(tenQue);

    if (!thongTinList || thongTinList.length === 0) {

        return { thongTinDuocChon: null, trangThai: 'Không tìm thấy' };

    }



    const laPhuMau = thongTinList.find(tt => tt.vaiTroTongQuat === 'Phụ Mẫu');

    if (laPhuMau) {

        return { thongTinDuocChon: laPhuMau, trangThai: 'Phụ Mẫu' };

    }



    const laTuTucTheoPhuMau = thongTinList.find(tt => 

        tt.vaiTroTongQuat === 'Tử Tức' && cacGiaDinhPhuMau.has(tt.giaDinh)

    );

    if (laTuTucTheoPhuMau) {

        return { thongTinDuocChon: laTuTucTheoPhuMau, trangThai: 'Tử Tức' };

    }



    const laHuynhDe = thongTinList.find(tt => 

        tt.vaiTroTongQuat === 'Tử Tức' && cacGiaDinhHuynhDe.has(tt.giaDinh)

    );

    if (laHuynhDe) {

        return { thongTinDuocChon: laHuynhDe, trangThai: 'Huynh Đệ' };

    }



    return { thongTinDuocChon: thongTinList[0], trangThai: 'KXĐ' };

}



// BƯỚC 2: Bộ máy thẩm định 6 Trụ

function phanTichNhatKhoaDayDu(input) {

    const cacTruInput = { 

        'Trụ Tuổi': input.truTuoi, 

        'Trụ Tọa': input.truToa, 

        'Trụ Ngày': input.truNgay, 

        'Trụ Năm': input.truNam, 

        'Trụ Tháng': input.truThang, 

        'Trụ Giờ': input.truGio 

    };



    const ketQuaCacTru = {};

    const thongKeAmDuong = { 'Dương': 0, 'Âm': 0, 'KXĐ': 0 };

    const thongKeVaiTro = { 'Phụ Mẫu': 0, 'Tử Tức': 0, 'Huynh Đệ': 0 };

    

    const cacGiaDinhPhuMau = new Set();

    const tanSuatGiaDinhTuTuc = {}; 

    const cacGiaDinhHuynhDe = new Set();



    Object.values(cacTruInput).forEach(tenQue => {

        if (!tenQue) return;

        const thongTinList = timThongTinQue(tenQue);

        const giaDinhDaQuet = new Set(); 



        thongTinList.forEach(tt => {

            if (tt.vaiTroTongQuat === 'Phụ Mẫu') {

                cacGiaDinhPhuMau.add(tt.giaDinh);

            } else if (tt.vaiTroTongQuat === 'Tử Tức') {

                giaDinhDaQuet.add(tt.giaDinh);

            }

        });



        giaDinhDaQuet.forEach(gd => {

            tanSuatGiaDinhTuTuc[gd] = (tanSuatGiaDinhTuTuc[gd] || 0) + 1;

        });

    });



    Object.keys(tanSuatGiaDinhTuTuc).forEach(gd => {

        if (tanSuatGiaDinhTuTuc[gd] >= 2) cacGiaDinhHuynhDe.add(gd);

    });



    let coKXD = false;

    for (const [tenTru, tenQue] of Object.entries(cacTruInput)) {

        if (tenQue) {

            const ketQua = xetVaiTroToiUu(tenQue, cacGiaDinhPhuMau, cacGiaDinhHuynhDe);

            ketQuaCacTru[tenTru] = { tenTru, tenQue, ...ketQua };



            if (ketQua.thongTinDuocChon) {

                if (ketQua.trangThai === 'KXĐ') {

                    thongKeAmDuong['KXĐ']++;

                    coKXD = true;

                } else {

                    thongKeAmDuong[ketQua.thongTinDuocChon.amDuong]++;

                    thongKeVaiTro[ketQua.trangThai]++;

                }

            }

        }

    }



    const thongTinHuynhDe = phanTichHuynhDe(ketQuaCacTru); 

    const cacCapThatTinh = phatHienThatTinhDaKiep(ketQuaCacTru);

    const canhBao = [];



    if (coKXD) canhBao.push({ type: 'critical', message: `TẠP KHÍ, ÂM DƯƠNG RỐI LOẠN (${thongKeAmDuong['KXĐ']} trụ mồ côi/KXĐ)` });

    

    if (thongKeAmDuong['Dương'] > 0 && thongKeAmDuong['Âm'] === 0) canhBao.push({ type: 'critical', message: 'CÔ DƯƠNG 6 TRỤ (Tuyệt Lệ)' });

    else if (thongKeAmDuong['Âm'] > 0 && thongKeAmDuong['Dương'] === 0) canhBao.push({ type: 'critical', message: 'CÔ ÂM 6 TRỤ (Tuyệt Lệ)' });



    if (input.lucXungList && input.lucXungList.length > 0) {

        canhBao.push({ type: 'critical', message: `CÓ TƯỚNG XUNG CHI: ${input.lucXungList.join(', ')}` });

    }



    let soAmTamTai = 0, soDuongTamTai = 0, soTruTamTaiHopLe = 0;

    const trucTamTai = ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày']; 

    

    trucTamTai.forEach(tenTru => {

        if (ketQuaCacTru[tenTru] && ketQuaCacTru[tenTru].thongTinDuocChon && ketQuaCacTru[tenTru].trangThai !== 'KXĐ') {

            const tt = ketQuaCacTru[tenTru].thongTinDuocChon;

            if (tt.amDuong === 'Âm') soAmTamTai++; 

            if (tt.amDuong === 'Dương') soDuongTamTai++;

            soTruTamTaiHopLe++;

        }

    });



    if (soTruTamTaiHopLe > 0) {

        if (soDuongTamTai > 0 && soAmTamTai === 0) 

            canhBao.push({ type: 'moderate', message: `Trục Tam Tài (Tuổi-Tọa-Ngày) CÔ DƯƠNG` });

        else if (soAmTamTai > 0 && soDuongTamTai === 0) 

            canhBao.push({ type: 'moderate', message: `Trục Tam Tài (Tuổi-Tọa-Ngày) CÔ ÂM` });

    }



    if (thongKeVaiTro['Phụ Mẫu'] === 0) canhBao.push({ type: 'moderate', message: 'Cục diện thiếu Phụ Mẫu (Gốc rễ)' });

    if (thongKeVaiTro['Tử Tức'] === 0 && thongKeVaiTro['Huynh Đệ'] === 0) canhBao.push({ type: 'moderate', message: 'Cục diện thiếu Tử Tức/Huynh Đệ (Phát triển)' });



    let danhGia = '', ratingClass = '';

    const coCritical = canhBao.some(cb => cb.type === 'critical');

    if (coCritical) { 

        danhGia = 'KHÔNG THỂ DÙNG'; ratingClass = 'rating-bad'; 

    } else {

        const soModerate = canhBao.filter(cb => cb.type === 'moderate').length;

        if (soModerate === 0) { danhGia = 'TỐT'; ratingClass = 'rating-good'; } 

        else if (soModerate <= 2) { danhGia = 'TRUNG BÌNH'; ratingClass = 'rating-medium'; } 

        else { danhGia = 'YẾU'; ratingClass = 'rating-bad'; }

    }



    return { ketQuaCacTru, thongTinHuynhDe, cacCapThatTinh, canhBao, danhGia, ratingClass };

}



const intersection = (...arrays) => {

    if (arrays.length === 0) return [];

    const result = arrays[0].filter(element => {

        for (let i = 1; i < arrays.length; i++) { if (!arrays[i].includes(element)) return false; }

        return true;

    });

    return [...new Set(result)];

};



function checkHanhRelations(h1, h2) {

    let results = [];

    if (h1 && h2) {

        if (h1 === h2) results.push("Cùng Quái");

        if (h1 + h2 === 5) results.push("Hợp Ngũ");

        if (h1 + h2 === 10) results.push("Hợp Thập");

        if (h1 + h2 === 15) results.push("Hợp Thập Ngũ");

        const pairs = [[1, 6], [2, 7], [3, 8], [4, 9]];

        if (pairs.some(p => (p[0] === h1 && p[1] === h2) || (p[0] === h2 && p[1] === h1))) results.push("Hà Đồ");

    }

    return results;

}



function checkVanRelations(v1, v2) {

    let results = [];

    if (v1 && v2) {

        if (v1 === v2) results.push("Cùng Quái");

        if (v1 + v2 === 5) results.push("Hợp Ngũ");

        if (v1 + v2 === 10) results.push("Hợp Thập");

        if (v1 + v2 === 15) results.push("Hợp Thập Ngũ");

        const haDoPairs = [[1, 6], [2, 7], [3, 8], [4, 9]];

        if (haDoPairs.some(p => (p[0] === v1 && p[1] === v2) || (p[0] === v2 && p[1] === v1))) results.push("Hà Đồ");

        const aiTinhPairs = [[1, 3], [2, 4], [6, 8], [7, 9]];

        if (aiTinhPairs.some(p => (p[0] === v1 && p[1] === v2) || (p[0] === v2 && p[1] === v1))) results.push("Điên Đảo Ai Tinh");

    }

    return results;

}



function checkDirectedRelations(h_dest, h_src) {

    let results = [];

     if (h_dest && h_src) {

        const HANH_ELEMENT_MAP = { 1: 'Thủy', 2: 'Hỏa', 3: 'Mộc', 4: 'Kim', 5: 'Thổ', 6: 'Thủy', 7: 'Hỏa', 8: 'Mộc', 9: 'Kim' };

        const SINH_MAP = { 'Kim': 'Thủy', 'Thủy': 'Mộc', 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim' };

        const KHAC_MAP = { 'Kim': 'Mộc', 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim' };

        if (HANH_ELEMENT_MAP[h_dest] === SINH_MAP[HANH_ELEMENT_MAP[h_src]]) results.push("Sinh Nhập");

        if (HANH_ELEMENT_MAP[h_dest] === KHAC_MAP[HANH_ELEMENT_MAP[h_src]]) results.push("Khắc Nhập");

    }

    return results;

}



function analyzeHanhPair(hanhArr1, hanhArr2, isDirected = false) {

    if (!hanhArr1 || hanhArr1.length === 0 || !hanhArr2 || hanhArr2.length === 0) return "-";

    const allRelations = new Set();

    for (const h1 of hanhArr1) {

        for (const h2 of hanhArr2) {

            const relations = isDirected ? checkDirectedRelations(h1, h2) : [...checkHanhRelations(h1, h2), ...checkDirectedRelations(h1, h2)];

            relations.forEach(r => allRelations.add(r));

        }

    }

    return allRelations.size > 0 ? [...allRelations].join(', ') : "-";

}



function analyzeVanPair(vanArr1, vanArr2) {

    if (!vanArr1 || vanArr1.length === 0 || !vanArr2 || vanArr2.length === 0) return "-";

    const allRelations = new Set();

    for (const v1 of vanArr1) {

        for (const v2 of vanArr2) {

            const relations = checkVanRelations(v1, v2);

            relations.forEach(r => allRelations.add(r));

        }

    }

    return allRelations.size > 0 ? [...allRelations].join(', ') : "-";

}

