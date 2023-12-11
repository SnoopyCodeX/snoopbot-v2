/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2023, SnoopyCodeX
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import chalk from 'chalk';
import Logger from './logger';
import { Innertube, UniversalCache, YTNodes } from 'youtubei.js';
import { FormatOptions } from 'youtubei.js/dist/src/types';
import { Readable } from "stream";
import axios, { AxiosResponse } from "axios";
import { ReadableStream, TransformStream } from 'stream/web';

const mime = require("mime")

export default class Downloader {
    public constructor()
    {}

    /**
     * A little roundabout solution to avoid
     * writing to filesystem when downloading
     * files and sending to messenger.
     * 
     * @credits itsmenewbie03 and https://github.com/absidue
     * @param {Readable} stream The readable stream to use
     * @param {string} filename The filename of the readable stream
     * @param {number} size The size of the readable stream
     * @param {string} mimetype The mimetype of the readable stream
     * @returns {Readable}
     */
    private static addFormDataInfo(stream: any, filename: string, size: number, mimetype: string) : any {
        stream.httpVersion = ''
        
        stream.client = {
            _httpMessage: {
                path: filename
            }
        }

        stream.headers = {
            'content-length': size,
            'content-type': mimetype
        }

        return stream;
    }

    /**
     * Converts an AxiosResponse to a ReadableStream<Uint8Array>
     * 
     * @param {AxiosResponse} response The axios response to be converted
     * @returns {ReadableStream<Uint8Array>}
     */
    private static async axiosResponseToReadableStream(response: AxiosResponse) : Promise<ReadableStream<Uint8Array>> {
        const { writable } = new TransformStream<Uint8Array>()

        const writer = writable.getWriter()

        return new ReadableStream<Uint8Array>({
            async start(controller) {
                const reader = response.data

                try {
                    reader.on('data', (chunk: Buffer) => {
                        const uint8Array = new Uint8Array(chunk)
                        writer.write(uint8Array)
                        controller.enqueue(uint8Array)
                    })

                    reader.on('end', () => {
                        writer.close();
                        controller.close();
                    });
              
                    reader.on('error', (error: any) => {
                        console.log(error.message)

                        writer.close();
                        controller.error(error);
                    });
                } catch(error: any) {
                    console.log(error.message)

                    writer.close();
                    controller.error(error);
                }
            }
        })
    }

    /**
     * Returns the extension for its type
     * 
     * @param {YTDownloadType} type The preferred download type
     * @returns {string}
     */
    private static getYTDownloadFileExtension(type: YTDownloadType) : string {
        return {
            'video': '.mp4',
            'audio': '.m4a',
            'video+audio': '.mp4'
        }[type]
    }

    /**
     * Downloads a file and returns it as a readable stream
     * 
     * @param {string} url The download url of the file
     * @param {boolean} debugMode Enables logging messages to console when set to `true`
     * @returns {Promise<DownloadResult>}
     */
    public static async downloadFile(url: string, debugMode: boolean = false) : Promise<DownloadResult> {
        try {
            const response = await axios.get(url, {responseType: "stream"})

            // Response status is not 200, throw an error
            if(response.status !== 200) {
                return {
                    hasError: true,
                    message: `Failed to download the file. Please try again. Status: ${response.status}, Response: ${response.statusText}`
                }
            }

            const readableUint8Array = await Downloader.axiosResponseToReadableStream(response)

            const sizeInBytes = parseInt(response.data.rawHeaders[response.data.rawHeaders.indexOf('Content-Length') + 1])
            const sizeInMB = Math.round((sizeInBytes / (1024 * 1024) + Number.EPSILON) * 100) / 100

            // If file size is greater than or equal to 25mb, throw an error
            if(sizeInMB > 25) {
                return {
                    hasError: true,
                    message: "File size exceeded facebook attachment's maximum file size of 25mb!"
                }
            }

            const fileMimeType = response.data.rawHeaders[response.data.rawHeaders.indexOf('Content-Type') + 1]
            const filename = `file.${mime.getExtension(fileMimeType)}`

            // Download success, return the file as a readable stream
            return {
                hasError: false,
                results: [
                    Downloader.addFormDataInfo(Readable.fromWeb(readableUint8Array), filename, sizeInBytes, fileMimeType),
                    filename
                ]
            }
        } catch(error: any) {
            if(debugMode)
                Logger.error(`${chalk.bgRed.white.bold`Downloader::downloadFile`} ${JSON.stringify([error.message])}`)

            return {
                hasError: true,
                message: "An unexpected error has occured, please try again. Error: " + error 
            }
        }
    }

    /**
     * Downloads the specified youtube video
     * as an audio or video file and returns
     * it as a readable stream.
     * 
     * @param {string} video The title of the video to search and download on youtube
     * @param {YTDownloadType} type The preferred download type
     * @param {boolean} debugMode Enabled logging messages to console when set to `true`
     * @returns {Promise<DownloadResult>}
     */
    public static async downloadYTVideo(video: string, type: YTDownloadType = 'video+audio', debugMode: boolean = false): Promise<DownloadResult> {
        try {
            const yt = await Innertube.create({cache: new UniversalCache(false), generate_session_locally: true})
            const searchResult = await yt.search(video, {sort_by: "relevance"})
            
            // No search results found
            if(searchResult.results === undefined) {
                return {
                    hasError: true,
                    message: "No search results found"
                }
            }
            
            const filterTypes = ['ShowingResultsFor', 'Channel', 'Shelf','ReelShelf'];
            const filteredSearchResult = searchResult.results!.filter((result) => !filterTypes.includes(result.type))

            // After filtering, no search results found
            if(filteredSearchResult.length == 0) {
                return {
                    hasError: true,
                    message: "No search results found"
                }
            }

            const firstSearchResult = filteredSearchResult.shift()!.as(YTNodes.Video)
            const videoID = firstSearchResult.id
            const videoTitle = firstSearchResult.title.text ?? video
            const info = await yt.getBasicInfo(videoID)

            const videoFormatOptions: FormatOptions = {
                type: type,
                quality: 'best',
                format: 'mp4'
            }

            const formattedVideo = info.chooseFormat(videoFormatOptions)
            const sizeInBytes = formattedVideo.content_length ?? 0
            const sizeInMB = Math.round((sizeInBytes / (1024 * 1024) + Number.EPSILON) * 100) / 100

            // If file size is greater than or equal to 25mb, throw an error
            if(sizeInMB > 25) {
                return {
                    hasError: true,
                    message: "Video file size exceeded facebook attachment's maximum file size of 25mb!"
                }
            }

            const downloadStream = await info.download({ ...videoFormatOptions })
            const downladFilename = `${videoTitle + Downloader.getYTDownloadFileExtension(type)}`
            const downloadMimeType = formattedVideo.mime_type.split(';').shift() ?? ""

            // Download success, return the file as a readable stream
            return {
                hasError: false,
                results: [
                    Downloader.addFormDataInfo(Readable.fromWeb(downloadStream), downladFilename, sizeInBytes, downloadMimeType), 
                    videoTitle
                ]
            }
        } catch(error: any) {
            if(debugMode)
                Logger.error(`${chalk.bgRed.white.bold`Downloader::downloadYTVideo`} ${JSON.stringify([error.message])}`)

            return {
                hasError: true,
                message: "An unexpected error has occured, please try again"
            }
        }
    }
}