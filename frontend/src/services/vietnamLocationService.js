/**
 * Service để lấy dữ liệu tỉnh thành Việt Nam
 */
const vietnamLocationService = {
    /**
     * Lấy danh sách tỉnh thành Việt Nam
     */
    getProvinces: async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/?depth=1');
            if (!response.ok) {
                throw new Error('Không thể tải danh sách tỉnh thành');
            }
            const data = await response.json();
            
            // Format data để phù hợp với component
            return data.map(province => ({
                code: province.code,
                name: province.name,
                codename: province.codename,
                division_type: province.division_type,
                phone_code: province.phone_code
            }));
        } catch (error) {
            console.error('Error fetching provinces:', error);
            // Fallback data nếu API không hoạt động
            return [
                { code: 1, name: "Thành phố Hà Nội", codename: "thanh_pho_ha_noi", division_type: "thành phố trung ương", phone_code: 24 },
                { code: 79, name: "Thành phố Hồ Chí Minh", codename: "thanh_pho_ho_chi_minh", division_type: "thành phố trung ương", phone_code: 28 },
                { code: 48, name: "Thành phố Đà Nẵng", codename: "thanh_pho_da_nang", division_type: "thành phố trung ương", phone_code: 236 },
                { code: 92, name: "Thành phố Cần Thơ", codename: "thanh_pho_can_tho", division_type: "thành phố trung ương", phone_code: 292 },
                { code: 31, name: "Tỉnh Hải Phòng", codename: "tinh_hai_phong", division_type: "thành phố trung ương", phone_code: 225 },
                { code: 2, name: "Tỉnh Hà Giang", codename: "tinh_ha_giang", division_type: "tỉnh", phone_code: 219 },
                { code: 4, name: "Tỉnh Cao Bằng", codename: "tinh_cao_bang", division_type: "tỉnh", phone_code: 206 },
                { code: 6, name: "Tỉnh Bắc Kạn", codename: "tinh_bac_kan", division_type: "tỉnh", phone_code: 209 },
                { code: 8, name: "Tỉnh Tuyên Quang", codename: "tinh_tuyen_quang", division_type: "tỉnh", phone_code: 207 },
                { code: 10, name: "Tỉnh Lào Cai", codename: "tinh_lao_cai", division_type: "tỉnh", phone_code: 214 },
                { code: 11, name: "Tỉnh Điện Biên", codename: "tinh_dien_bien", division_type: "tỉnh", phone_code: 215 },
                { code: 12, name: "Tỉnh Lai Châu", codename: "tinh_lai_chau", division_type: "tỉnh", phone_code: 213 },
                { code: 14, name: "Tỉnh Sơn La", codename: "tinh_son_la", division_type: "tỉnh", phone_code: 212 },
                { code: 15, name: "Tỉnh Yên Bái", codename: "tinh_yen_bai", division_type: "tỉnh", phone_code: 216 },
                { code: 17, name: "Tỉnh Hoà Bình", codename: "tinh_hoa_binh", division_type: "tỉnh", phone_code: 218 },
                { code: 19, name: "Tỉnh Thái Nguyên", codename: "tinh_thai_nguyen", division_type: "tỉnh", phone_code: 208 },
                { code: 20, name: "Tỉnh Lạng Sơn", codename: "tinh_lang_son", division_type: "tỉnh", phone_code: 205 },
                { code: 22, name: "Tỉnh Quảng Ninh", codename: "tinh_quang_ninh", division_type: "tỉnh", phone_code: 203 },
                { code: 24, name: "Tỉnh Bắc Giang", codename: "tinh_bac_giang", division_type: "tỉnh", phone_code: 204 },
                { code: 25, name: "Tỉnh Phú Thọ", codename: "tinh_phu_tho", division_type: "tỉnh", phone_code: 210 },
                { code: 26, name: "Tỉnh Vĩnh Phúc", codename: "tinh_vinh_phuc", division_type: "tỉnh", phone_code: 211 },
                { code: 27, name: "Tỉnh Bắc Ninh", codename: "tinh_bac_ninh", division_type: "tỉnh", phone_code: 222 },
                { code: 30, name: "Tỉnh Hải Dương", codename: "tinh_hai_duong", division_type: "tỉnh", phone_code: 220 },
                { code: 33, name: "Tỉnh Hưng Yên", codename: "tinh_hung_yen", division_type: "tỉnh", phone_code: 221 },
                { code: 34, name: "Tỉnh Thái Bình", codename: "tinh_thai_binh", division_type: "tỉnh", phone_code: 227 },
                { code: 35, name: "Tỉnh Hà Nam", codename: "tinh_ha_nam", division_type: "tỉnh", phone_code: 226 },
                { code: 36, name: "Tỉnh Nam Định", codename: "tinh_nam_dinh", division_type: "tỉnh", phone_code: 228 },
                { code: 37, name: "Tỉnh Ninh Bình", codename: "tinh_ninh_binh", division_type: "tỉnh", phone_code: 229 },
                { code: 38, name: "Tỉnh Thanh Hóa", codename: "tinh_thanh_hoa", division_type: "tỉnh", phone_code: 237 },
                { code: 40, name: "Tỉnh Nghệ An", codename: "tinh_nghe_an", division_type: "tỉnh", phone_code: 238 },
                { code: 42, name: "Tỉnh Hà Tĩnh", codename: "tinh_ha_tinh", division_type: "tỉnh", phone_code: 239 },
                { code: 44, name: "Tỉnh Quảng Bình", codename: "tinh_quang_binh", division_type: "tỉnh", phone_code: 232 },
                { code: 45, name: "Tỉnh Quảng Trị", codename: "tinh_quang_tri", division_type: "tỉnh", phone_code: 233 },
                { code: 46, name: "Tỉnh Thừa Thiên Huế", codename: "tinh_thua_thien_hue", division_type: "tỉnh", phone_code: 234 },
                { code: 49, name: "Tỉnh Quảng Nam", codename: "tinh_quang_nam", division_type: "tỉnh", phone_code: 235 },
                { code: 51, name: "Tỉnh Quảng Ngãi", codename: "tinh_quang_ngai", division_type: "tỉnh", phone_code: 255 },
                { code: 52, name: "Tỉnh Bình Định", codename: "tinh_binh_dinh", division_type: "tỉnh", phone_code: 256 },
                { code: 54, name: "Tỉnh Phú Yên", codename: "tinh_phu_yen", division_type: "tỉnh", phone_code: 257 },
                { code: 56, name: "Tỉnh Khánh Hòa", codename: "tinh_khanh_hoa", division_type: "tỉnh", phone_code: 258 },
                { code: 58, name: "Tỉnh Ninh Thuận", codename: "tinh_ninh_thuan", division_type: "tỉnh", phone_code: 259 },
                { code: 60, name: "Tỉnh Bình Thuận", codename: "tinh_binh_thuan", division_type: "tỉnh", phone_code: 252 },
                { code: 62, name: "Tỉnh Kon Tum", codename: "tinh_kon_tum", division_type: "tỉnh", phone_code: 260 },
                { code: 64, name: "Tỉnh Gia Lai", codename: "tinh_gia_lai", division_type: "tỉnh", phone_code: 269 },
                { code: 66, name: "Tỉnh Đắk Lắk", codename: "tinh_dak_lak", division_type: "tỉnh", phone_code: 262 },
                { code: 67, name: "Tỉnh Đắk Nông", codename: "tinh_dak_nong", division_type: "tỉnh", phone_code: 261 },
                { code: 68, name: "Tỉnh Lâm Đồng", codename: "tinh_lam_dong", division_type: "tỉnh", phone_code: 263 },
                { code: 70, name: "Tỉnh Bình Phước", codename: "tinh_binh_phuoc", division_type: "tỉnh", phone_code: 271 },
                { code: 72, name: "Tỉnh Tây Ninh", codename: "tinh_tay_ninh", division_type: "tỉnh", phone_code: 276 },
                { code: 74, name: "Tỉnh Bình Dương", codename: "tinh_binh_duong", division_type: "tỉnh", phone_code: 274 },
                { code: 75, name: "Tỉnh Đồng Nai", codename: "tinh_dong_nai", division_type: "tỉnh", phone_code: 251 },
                { code: 77, name: "Tỉnh Bà Rịa - Vũng Tàu", codename: "tinh_ba_ria_vung_tau", division_type: "tỉnh", phone_code: 254 },
                { code: 80, name: "Tỉnh Long An", codename: "tinh_long_an", division_type: "tỉnh", phone_code: 272 },
                { code: 82, name: "Tỉnh Tiền Giang", codename: "tinh_tien_giang", division_type: "tỉnh", phone_code: 273 },
                { code: 83, name: "Tỉnh Bến Tre", codename: "tinh_ben_tre", division_type: "tỉnh", phone_code: 275 },
                { code: 84, name: "Tỉnh Trà Vinh", codename: "tinh_tra_vinh", division_type: "tỉnh", phone_code: 294 },
                { code: 86, name: "Tỉnh Vĩnh Long", codename: "tinh_vinh_long", division_type: "tỉnh", phone_code: 270 },
                { code: 87, name: "Tỉnh Đồng Tháp", codename: "tinh_dong_thap", division_type: "tỉnh", phone_code: 277 },
                { code: 89, name: "Tỉnh An Giang", codename: "tinh_an_giang", division_type: "tỉnh", phone_code: 296 },
                { code: 91, name: "Tỉnh Kiên Giang", codename: "tinh_kien_giang", division_type: "tỉnh", phone_code: 297 },
                { code: 93, name: "Tỉnh Hậu Giang", codename: "tinh_hau_giang", division_type: "tỉnh", phone_code: 293 },
                { code: 94, name: "Tỉnh Sóc Trăng", codename: "tinh_soc_trang", division_type: "tỉnh", phone_code: 299 },
                { code: 95, name: "Tỉnh Bạc Liêu", codename: "tinh_bac_lieu", division_type: "tỉnh", phone_code: 291 },
                { code: 96, name: "Tỉnh Cà Mau", codename: "tinh_ca_mau", division_type: "tỉnh", phone_code: 290 }
            ];
        }
    },

    /**
     * Lấy danh sách quận/huyện theo tỉnh
     * @param {number} provinceCode - Mã tỉnh
     */
    getDistricts: async (provinceCode) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            if (!response.ok) {
                throw new Error('Không thể tải danh sách quận/huyện');
            }
            const data = await response.json();
            
            return data.districts?.map(district => ({
                code: district.code,
                name: district.name,
                codename: district.codename,
                division_type: district.division_type,
                province_code: district.province_code
            })) || [];
        } catch (error) {
            console.error('Error fetching districts:', error);
            return [];
        }
    },

    /**
     * Lấy danh sách phường/xã theo quận/huyện
     * @param {number} districtCode - Mã quận/huyện
     */
    getWards: async (districtCode) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            if (!response.ok) {
                throw new Error('Không thể tải danh sách phường/xã');
            }
            const data = await response.json();
            
            return data.wards?.map(ward => ({
                code: ward.code,
                name: ward.name,
                codename: ward.codename,
                division_type: ward.division_type,
                district_code: ward.district_code
            })) || [];
        } catch (error) {
            console.error('Error fetching wards:', error);
            return [];
        }
    },

    /**
     * Tìm kiếm tỉnh thành theo tên
     * @param {string} query - Từ khóa tìm kiếm
     */
    searchProvinces: async (query) => {
        try {
            const provinces = await vietnamLocationService.getProvinces();
            return provinces.filter(province => 
                province.name.toLowerCase().includes(query.toLowerCase()) ||
                province.codename.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('Error searching provinces:', error);
            return [];
        }
    }
};

export default vietnamLocationService; 