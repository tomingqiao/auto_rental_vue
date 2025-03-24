export default function getPermissionIcon(permissionCode) {
    let iconMap = JSON.parse(sessionStorage.getItem('iconMap'))
    return iconMap[permissionCode]
}