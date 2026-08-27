// ==========================================
// HUYENKHONG.JS - Huyền Không Đại Quái
// ==========================================
// Tra cứu quẻ theo độ số, tính Hành/Vận,
// phân tích quan hệ quẻ, Thất Tinh Đả Kiếp,
// đánh giá Âm Dương, Phụ Mẫu, Tử Tức, Huynh Đệ.

// ---------- TRA CỨU DỮ LIỆU THEO ĐỘ ----------
function findDataByDegree(degree) {
    let normalizedDegree = parseFloat(degree);
    if (isNaN(normalizedDegree)) return null;
    while (normalizedDegree >= 360) normalizedDegree -= 360;
    while (normalizedDegree < 0) normalizedDegree += 360;
    if (normalizedDegree === 360) normalizedDegree = 0;

    const findInRange = (data) => data.find(d => {
        if (d.from > d.to) return normalizedDegree >= d.from || normalizedDegree < d.to;
        return normalizedDegree >= d.from && normalizedDegree < d.to;
    });

    const detail = findInRange(huyenKhongData_DegreeMap);
    if (!detail) return null;

    return {
        phuong: findInRange(phuongData)?.name || 'N/A',
        huong: findInRange(huongData)?.name || 'N/A',
        son: findInRange(sonData)?.name || 'N/A',
        canChi: detail.canChi
    };
}

// ---------- LẤY HÀNH / VẬN TỪ CAN CHI ----------
function getHanhFromCanChi(canChi) {
    if (!canChi || !hoaGiapData[canChi]) return [];
    return hoaGiapData[canChi].map(item => item.h);
}

function getVanFromCanChi(canChi) {
    if (!canChi || !hoaGiapData[canChi]) return [];
    return hoaGiapData[canChi].map(item => item.v);
}

// ---------- FORMAT HIỂN THỊ HCCV & QUẺ ----------
function formatHccvAndQue(canChi) {
    if (!canChi || !hoaGiapData[canChi]) return 'N/A\nN/A';
    const hccvData = hoaGiapData[canChi];
    const queDataFromMap = huyenKhongQueMap[canChi] || ['N/A'];
    const results = [];

    for (let i = 0; i < hccvData.length; i++) {
        const item = hccvData[i];
        const queName = queDataFromMap[i] || queDataFromMap[0];
        const hccvString = `${item.h} - ${canChi.replace(' ', '-')} - ${item.v}`;
        const quanHeStrings = quanHeQueData[queName];
        let finalString = `${hccvString}\n${queName}`;
        if (quanHeStrings && quanHeStrings.length > 0) {
            finalString += '\n' + quanHeStrings.join('\n');
        }
        results.push(finalString);
    }
    return results.join('\n-----\n');
}

// ---------- TRA CỨU THÔNG TIN QUẺ ----------
function timThongTinQue(tenQue) {
    return HKDQ_DATABASE[tenQue] || [];
}

// ---------- PHÁT HIỆN THẤT TINH ĐẢ KIẾP ----------
function phatHienThatTinhDaKiep(ketQuaCacTru) {
    const cacCapThatTinh = [];
    const danhSachTru = Object.entries(ketQuaCacTru)
        .filter(([_, data]) => data.tenQue)
        .map(([tenTru, data]) => ({ tenTru, tenQue: data.tenQue }));

    for (let i = 0; i < danhSachTru.length; i++) {
        for (let j = i + 1; j < danhSachTru.length; j++) {
            const tru1 = danhSachTru[i], tru2 = danhSachTru[j];
            if (HKDQ_MAP_THAT_TINH[tru1.tenQue] && HKDQ_MAP_THAT_TINH[tru1.tenQue].includes(tru2.tenQue)) {
                cacCapThatTinh.push({
                    tru1: tru1.tenTru, que1: tru1.tenQue,
                    tru2: tru2.tenTru, que2: tru2.tenQue
                });
            }
        }
    }
    return cacCapThatTinh;
}

// ---------- PHÂN TÍCH HUYNH ĐỆ ----------
function phanTichHuynhDe(ketQuaCacTru) {
    const giaDinhTuTuc = {};
    const danhSachHuynhDe = [];

    Object.values(ketQuaCacTru).forEach(tru => {
        if (tru.thongTinDuocChon && (tru.trangThai === 'Tử Tức' || tru.trangThai === 'Huynh Đệ')) {
            const giaDinh = tru.thongTinDuocChon.giaDinh;
            if (!giaDinhTuTuc[giaDinh]) giaDinhTuTuc[giaDinh] = [];
            giaDinhTuTuc[giaDinh].push(tru);
        }
    });

    let tongHuynhDe = 0;
    Object.values(giaDinhTuTuc).forEach(danhSach => {
        if (danhSach.length >= 2) {
            tongHuynhDe += danhSach.length;
            danhSachHuynhDe.push({
                giaDinh: danhSach[0].thongTinDuocChon.giaDinh,
                soLuong: danhSach.length
            });
        }
    });

    return {
        tongHuynhDe,
        chiTiet: danhSachHuynhDe.map(hd => `${hd.giaDinh}: ${hd.soLuong} quẻ`).join(', ')
    };
}

// ---------- QUAN HỆ HÀNH ----------
function checkHanhRelations(h1, h2) {
    let results = [];
    if (h1 && h2) {
        if (h1 === h2) results.push("Cùng Quái");
        if (h1 + h2 === 5) results.push("Hợp Ngũ");
        if (h1 + h2 === 10) results.push("Hợp Thập");
        if (h1 + h2 === 15) results.push("Hợp Thập Ngũ");
        const pairs = [[1, 6], [2, 7], [3, 8], [4, 9]];
        if (pairs.some(p => (p[0] === h1 && p[1] === h2) || (p[0] === h2 && p[1] === h1))) {
            results.push("Hà Đồ");
        }
    }
    return results;
}

// ---------- QUAN HỆ VẬN ----------
function checkVanRelations(v1, v2) {
    let results = [];
    if (v1 && v2) {
        if (v1 === v2) results.push("Cùng Quái");
        if (v1 + v2 === 5) results.push("Hợp Ngũ");
        if (v1 + v2 === 10) results.push("Hợp Thập");
        if (v1 + v2 === 15) results.push("Hợp Thập Ngũ");
        const haDoPairs = [[1, 6], [2, 7], [3, 8], [4, 9]];
        if (haDoPairs.some(p => (p[0] === v1 && p[1] === v2) || (p[0] === v2 && p[1] === v1))) {
            results.push("Hà Đồ");
        }
        const aiTinhPairs = [[1, 3], [2, 4], [6, 8], [7, 9]];
        if (aiTinhPairs.some(p => (p[0] === v1 && p[1] === v2) || (p[0]
            results.push("Điên Đảo Ai Tinh");
        }
    }
    return results;
}

// ---------- QUAN HỆ CÓ HƯỚNG (SINH/KHẮC) ----------
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

// ---------- XÉT VAI TRÒ TỐI ƯU CHO MỘT QUẺ ----------
function xetVaiTroToiUu(tenQue, diemThanhThe, tanSuatGiaDinhTuTuc) {
    const thongTinList = timThongTinQue(tenQue);
    if (!thongTinList || thongTinList.length === 0) {
        return { thongTinDuocChon: null, trangThai: 'Không tìm thấy' };
    }

    const laPhuMau = thongTinList.find(tt => tt.vaiTroTongQuat === 'Phụ Mẫu');
    if (laPhuMau) return { thongTinDuocChon: laPhuMau, trangThai: 'Phụ Mẫu' };

    const cacLuaChonTuTuc = thongTinList.filter(tt => tt.vaiTroTongQuat === 'Tử Tức');
    if (cacLuaChonTuTuc.length > 0) {
        cacLuaChonTuTuc.sort((a, b) => {
            const diemDiff = (diemThanhThe[b.giaDinh] || 0) - (diemThanhThe[a.giaDinh] || 0);
            if (diemDiff !== 0) return diemDiff;
            return (tanSuatGiaDinhTuTuc[b.giaDinh] || 0) - (tanSuatGiaDinhTuTuc[a.giaDinh] || 0);
        });

        const luaChonTotNhat = cacLuaChonTuTuc[0];
        const diemCuaLuaChon = diemThanhThe[luaChonTotNhat.giaDinh] || 0;
        if (diemCuaLuaChon >= 10) return { thongTinDuocChon: luaChonTotNhat, trangThai: 'Tử Tức' };
        if (diemCuaLuaChon >= 2) return { thongTinDuocChon: luaChonTotNhat, trangThai: 'Huynh Đệ' };
    }

    return { thongTinDuocChon: thongTinList[0], trangThai: 'KXĐ' };
}

// ---------- PHÂN TÍCH NHẤT KHÓA ĐẦY ĐỦ ----------
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
    const diemThanhThe = {};
    const tanSuatGiaDinhTuTuc = {};
    const trucTamTai = ['Trụ Tuổi', 'Trụ Tọa', 'Trụ Ngày'];

    // Lần quét 1: Tính điểm thanh thế
    for (const [tenTru, tenQue] of Object.entries(cacTruInput)) {
        if (!tenQue) continue;
        const thongTinList = timThongTinQue(tenQue);
        const giaDinhDaQuet = new Set();
        const heSoViTri = trucTamTai.includes(tenTru) ? 2 : 1;

        thongTinList.forEach(tt => {
            if (!diemThanhThe[tt.giaDinh]) diemThanhThe[tt.giaDinh] = 0;
            if (tt.vaiTroTongQuat === 'Phụ Mẫu') {
                diemThanhThe[tt.giaDinh] += 10 * heSoViTri;
            } else if (tt.vaiTroTongQuat === 'Tử Tức') {
                diemThanhThe[tt.giaDinh] += 1 * heSoViTri;
                giaDinhDaQuet.add(tt.giaDinh);
            }
        });

        giaDinhDaQuet.forEach(gd => {
            tanSuatGiaDinhTuTuc[gd] = (tanSuatGiaDinhTuTuc[gd] || 0) + 1;
        });
    }

    // Lần quét 2: Gán vai trò
    let coKXD = false;
    for (const [tenTru, tenQue] of Object.entries(cacTruInput)) {
        if (tenQue) {
            const ketQua = xetVaiTroToiUu(tenQue, diemThanhThe, tanSuatGiaDinhTuTuc);
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

    if (coKXD) canhBao.push({ type: 'critical', message: `TẠP KHÍ, ÂM DƯƠNG RỐI LOẠN (${thongKeAmDuong['KXĐ']} trụ KXĐ)` });
    if (thongKeAmDuong['Dương'] > 0 && thongKeAmDuong['Âm'] === 0) canhBao.push({ type: 'critical', message: 'CÔ DƯƠNG 6 TRỤ' });
    else if (thongKeAmDuong['Âm'] > 0 && thongKeAmDuong['Dương'] === 0) canhBao.push({ type: 'critical', message: 'CÔ ÂM 6 TRỤ' });

    if (input.lucXungList && input.lucXungList.length > 0) {
        canhBao.push({ type: 'critical', message: `CÓ TƯỚNG XUNG CHI: ${input.lucXungList.join(', ')}` });
    }

    let soAmTamTai = 0, soDuongTamTai = 0, soTruTamTaiHopLe = 0;
    trucTamTai.forEach(tenTru => {
        if (ketQuaCacTru[tenTru] && ketQuaCacTru[tenTru].thongTinDuocChon && ketQuaCacTru[tenTru].trangThai !== 'KXĐ') {
            const tt = ketQuaCacTru[tenTru].thongTinDuocChon;
            if (tt.amDuong === 'Âm') soAmTamTai++;
            if (tt.amDuong === 'Dương') soDuongTamTai++;
            soTruTamTaiHopLe++;
        }
    });

    if (soTruTamTaiHopLe > 0) {
        if (soDuongTamTai > 0 && soAmTamTai === 0) canhBao.push({ type: 'moderate', message: 'Trục Tam Tài (Tuổi-Tọa-Ngày) CÔ DƯƠNG' });
        else if (soAmTamTai > 0 && soDuongTamTai === 0) canhBao.push({ type: 'moderate', message: 'Trục Tam Tài (Tuổi-Tọa-Ngày) CÔ ÂM' });
    }

    if (thongKeVaiTro['Phụ Mẫu'] === 0) canhBao.push({ type: 'moderate', message: 'Thiếu Phụ Mẫu (Gốc rễ)' });
    if (thongKeVaiTro['Tử Tức'] === 0 && thongKeVaiTro['Huynh Đệ'] === 0) canhBao.push({ type: 'moderate', message: 'Thiếu Tử Tức/Huynh Đệ' });

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

