/*
    js-blend - Blend objects
 */

import {clone} from 'js-clone'

const RECURSE_LIMIT = 75

export function blend(dest, src, combine = '', recurse = 0) {
    if (recurse > RECURSE_LIMIT) {
        return
    }
    if (!src) {
        return dest
    }
    if (!dest || typeof dest != 'object' || Array.isArray(dest)) {
        return dest
    }
    for (let key of Object.getOwnPropertyNames(src)) {
        let property = key
        let op = key[0]
        if (op == '+') {
            property = key.slice(1)
        } else if (op == '-') {
            property = key.slice(1)
        } else if (op == '?') {
            property = key.slice(1)
        } else if (op == '=') {
            property = key.slice(1)
        } else if (combine) {
            op = combine
        } else {
            /* Default is to blend objects and assign arrays */
            op = ''
        }
        let s = src[key]
        let d = dest[property]
        if (!dest.hasOwnProperty(property)) {
            if (op == '-') {
                continue
            }
            dest[property] = clone(s)
            continue
        } else if (op == '?' && d != null) {
            continue
        }
        if (Array.isArray(d)) {
            if (op == '=') {
                /* op == '=' */
                dest[property] = clone(s)
            } else if (op == '-') {
                if (Array.isArray(s)) {
                    for (let item of s) {
                        let index = d.indexOf(item)
                        if (index >= 0) d.slice(index, 1)
                    }
                } else {
                    let index = d.indexOf(s)
                    if (index >= 0) d.slice(index, 1)
                }
            } else if (op == '+') {
                /*
                    This was the default, but blending Package.sensors.http.path from PackageOverride needs to
                    overwrite and not union.
                 */
                if (Array.isArray(s)) {
                    for (let item of s) {
                        if (d.indexOf(s) < 0) d.push(item)
                    }
                } else {
                    d.push(s)
                }
            } else {
                dest[property] = clone(s)
            }
        } else if (d instanceof Date) {
            if (op == '+') {
                dest[property] += s
            } else if (op == '-') {
                dest[property] -= s
            } else {
                /* op == '=' */
                dest[property] = s
            }
        } else if (typeof d == 'object' && d !== null && d !== undefined) {
            if (op == '=') {
                dest[property] = clone(s)
            } else if (op == '-') {
                delete dest[property]
            } else if (s === null) {
                dest[property] = s
            } else if (typeof s == 'object') {
                blend(d, s, op, recurse + 1)
            } else {
                dest[property] = s
            }
        } else if (typeof d == 'string') {
            if (op == '+') {
                dest[property] += ' ' + s
            } else if (op == '-') {
                if (d == s) {
                    delete dest[property]
                } else {
                    dest[property] = d.replace(s, '')
                }
            } else {
                /* op == '=' */
                dest[property] = s
            }
        } else if (typeof d == 'number') {
            if (op == '+') {
                dest[property] += s
            } else if (op == '-') {
                dest[property] -= s
            } else {
                /* op == '=' */
                dest[property] = s
            }
        } else {
            if (op == '=') {
                dest[property] = s
            } else if (op == '-') {
                delete dest[property]
            } else {
                dest[property] = s
            }
        }
    }
    return dest
}
