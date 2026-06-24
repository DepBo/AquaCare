const supabase = require('../config/supabase');

// API Đăng ký
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ fullName, email, phone, password' });
    }

    // Bước 1: Tạo tài khoản Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      phone
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const user = authData?.user;
    if (!user) {
      return res.status(500).json({ error: 'Không thể tạo người dùng trong hệ thống Auth' });
    }

    // Bước 2: Insert thông tin vào bảng users
    const { error: dbError } = await supabase.from('users').insert([{
      id: user.id,
      full_name: fullName,
      email: email,
      phone: phone
    }]);

    if (dbError) {
      // Rollback: Xóa user khỏi bảng auth.users nếu insert user thất bại
      await supabase.auth.admin.deleteUser(user.id);
      console.error('Lỗi insert user:', dbError);
      return res.status(500).json({ error: 'Lỗi khi tạo thông tin người dùng. Đã rollback dữ liệu.' });
    }

    return res.status(200).json({
      message: 'Đăng ký thành công',
      user: {
        id: user.id,
        full_name: fullName,
        email,
        phone
      }
    });

  } catch (error) {
    console.error('Lỗi server khi đăng ký:', error);
    return res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
};

// API Đăng nhập
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp identifier và password' });
    }

    let authData, authError;

    // Phân loại Đăng nhập bằng Email hoặc Số điện thoại
    if (identifier.includes('@')) {
      const result = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password
      });
      authData = result.data;
      authError = result.error;
    } else {
      const result = await supabase.auth.signInWithPassword({
        phone: identifier,
        password: password
      });
      authData = result.data;
      authError = result.error;
    }

    if (authError) {
      return res.status(401).json({ error: 'Thông tin đăng nhập không chính xác' });
    }

    const user = authData?.user;
    const session = authData?.session;

    if (!user || !session) {
      return res.status(401).json({ error: 'Không thể lấy thông tin phiên đăng nhập' });
    }

    // Query lấy thêm thông tin role, full_name, phone từ bảng users
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('full_name, phone, role')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return res.status(500).json({ error: 'Không thể truy xuất thông tin người dùng' });
    }

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user_info: {
        id: user.id,
        email: user.email,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Lỗi server khi đăng nhập:', error);
    return res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
};
