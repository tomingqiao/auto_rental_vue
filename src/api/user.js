import requestHttp from '@/utils/request'


export async function login(data) {
  return await requestHttp.login('/rental/user/login', data)
}

export async function getInfo() {
  return await requestHttp.get('/rental/auth/getInfo')
}

export async function logout(param) {
  return await requestHttp.post('/rental/auth/logout',param)
}

export async function getMenuList() {
  return await requestHttp.get('/rental/auth/menuList')
}