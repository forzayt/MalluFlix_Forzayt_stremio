const fs = require('fs');
const path = require('path');

function parseM3U(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const channels = [];
    let currentChannel = {};

    for (const line of lines) {
        if (line.startsWith('#EXTINF:')) {
            const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
            const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
            const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
            const groupTitleMatch = line.match(/group-title="([^"]*)"/);
            const nameMatch = line.match(/,(.*)$/);

            currentChannel = {
                id: tvgIdMatch ? tvgIdMatch[1] : (tvgNameMatch ? tvgNameMatch[1].replace(/\s/g, '').toLowerCase() : 'unknown'),
                name: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
                title: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
                logo: tvgLogoMatch ? tvgLogoMatch[1] : null,
                group: groupTitleMatch ? groupTitleMatch[1] : 'M3U Playlist',
                url: '',
            };
        } else if (line.startsWith('#EXTGRP:')) {
            const groupName = line.substring(8).trim();
            if (currentChannel.group === 'M3U Playlist') {
                currentChannel.group = groupName;
            }
        } else if (line.startsWith('http') || line.startsWith('https')) {
            currentChannel.url = line.trim();
            if (currentChannel.url && currentChannel.name) {
                channels.push(currentChannel);
            }
            currentChannel = {}; // Reset for the next channel
        }
    }
    return channels;
}

function parseM3UDirectory(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true })
        .filter(f => f.isFile() && /\.m3u8?$/i.test(f.name))
        .map(f => path.join(dirPath, f.name));
    const all = [];
    for (const file of files) {
        const channels = parseM3U(file);
        for (const ch of channels) all.push(ch);
    }
    return all;
}

module.exports = { parseM3U, parseM3UDirectory };