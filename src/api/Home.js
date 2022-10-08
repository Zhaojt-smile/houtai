import request from '../utils/request'

export function getData() {
    return request({
        url: '/api/ug/api/wuhan/app/data/list-total?t=330415245809',
        method: 'get'
    })
}