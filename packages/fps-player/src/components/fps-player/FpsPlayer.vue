<template>
  <!-- 图片播放器 -->
  <div
    class="image-player"
    ref="imagePlayerRef"
    :class="{
      'image-player-full': state.isFullScreen,
    }"
  >
    <!-- 主界面 -->
    <div
      class="image-player-main"
      :style="{
        borderRadius: state.isFullScreen ? 0 : undefined,
      }"
    >
      <!-- 播放界面 -->
      <div class="image-player-content">
        <!-- 背景层（包含背景色及默认图片/状态图片等） -->
        <div v-if="state.videoDuration === 0" class="image-player-background"></div>

        <!-- 视频播放窗口 -->
        <div
          class="image-player-content"
          :style="{
            borderRadius: state.isFullScreen ? 0 : undefined,
          }"
        >
          <video v-if="props.videoMode" @timeupdate="onVideoTimeupdate" ref="videoRef" :src="props.videoUrl"></video>
          <img v-else :src="fillFpsImages[state.actFpsIdx]" alt="" />
        </div>

        <!-- 右上角可切换悬浮窗口 -->
        <div @click="switchVisual" class="image-player-content-mini">
          <!-- 悬浮窗口视频内容 -->
          <img v-if="props.videoMode" :src="fillFpsImages[state.actFpsIdx]" alt="" />
          <video v-else @timeupdate="onVideoTimeupdate" ref="videoRef" :src="props.videoUrl"></video>
          <!-- 悬浮窗口标题 -->
          <span class="image-player-content-mini-title">{{ props.videoMode ? '患者视角' : 'MRC' }}</span>
        </div>

        <!-- 悬浮插件层（位于播放器视频界面中） -->
        <div class="image-player-content-plugin" v-if="state.videoDuration !== 0 && !actFpsLoading">
          <!-- 插件插槽 -->
          <slot name="content-plugin"></slot>
        </div>

        <!-- 工具层（例如长度/角度/坐标测量工具）【暂时不用】 -->
        <div ref="measureRef" v-if="props.measure" class="image-player-content-tools">
          <FpsMeasure :type="props.toolType" :width="state.measureWidth" :height="state.measureHeight" />
        </div>

        <!-- 视频标题 -->
        <h2 class="image-player-main-title">{{ props.videoMode ? 'MRC' : '患者视角' }}</h2>
      </div>
      <div
        class="image-player-controller"
        :class="{
          'full-screen': state.isFullScreen,
        }"
      >
        <!-- 进度栏 -->
        <div class="image-player-progress" @click="onProgressClick" @mouseover="onProgressMouseenter" @mouseout="onProgressMouseout">
          <!-- 进度条 -->
          <div class="image-player-progress-track">
            <!-- 加载的进度条 -->
            <div ref="progressLineRef" class="image-player-progress-track-pos">
              <!-- 进度条底色（白色底色 / 未加载部分） -->
              <div
                v-for="(item, idx) in bufferProgress"
                :key="idx"
                :style="{
                  flexGrow: item.flex,
                }"
                :class="[item.active ? 'image-player-progress-track-not-loaded' : 'image-player-progress-track-loaded']"
              ></div>
              <!-- 进度条底色（灰色 / 多段 / 已加载部分） -->
              <!-- <div  class="image-player-progress-track-loaded"></div> -->
            </div>

            <!-- 进度条颜色（已播放部分） -->
            <div
              v-if="state.progress !== 0"
              :style="{
                width: `${leftOffset + 5}px`,
              }"
              class="image-player-progress-track-active"
            ></div>
            <!-- 当前进度标识 -->
            <div
              @mousedown="onProgressDotMousedown"
              ref="progressDotRef"
              :style="{
                transform: `translateX(${leftOffset}px)`,
              }"
              class="image-player-progress-bar"
            >
              <!-- 当前进度（圆点） -->
              <div class="image-player-progress-bar-point"></div>
              <!-- 当前进度（时间） -->
              <div class="image-player-progress-bar-time">{{ currentTime }}</div>
            </div>
            <!-- 当前进度（缩略图） -->
            <!-- 注：光标在进度条上滑过时显示光标当前帧，而不是进度圆点拖拽时显示 -->
            <img
              v-if="state.isHoveringProgress"
              :style="{
                transform: `translateX(${hoveringLeftOffset}px)`,
              }"
              class="image-player-progress-bar-thumbnail"
              :src="fillFpsImages[state.previewFpsIdx]"
            />
          </div>
          <!-- 进度条时间 -->
          <div class="image-player-progress-time">
            <!-- 开始时间 -->
            <span class="image-player-progress-starttime">{{ currentTime }}</span>
            <!-- 结束时间 -->
            <div class="image-player-progress-endtime">{{ formatSeconds(state.videoDuration) }}</div>
          </div>
        </div>
        <!-- 工具栏（前进后退播放暂停等） -->
        <div class="image-player-toolpanel">
          <div class="image-player-tool-group">
            <div
              @click="setMultipySpeed(-1)"
              :class="{
                disabled: state.multipySpeed <= state.minMulitpy,
              }"
              class="image-player-tool-item"
            >
              <label>倍速-</label>
              <svg width="22px" height="22px" viewBox="0 0 22 22">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-304.000000, -764.000000)">
                    <g transform="translate(24.000000, 152.000000)">
                      <path
                        d="M4,0 L964,0 C966.209139,-4.05812251e-16 968,1.790861 968,4 L968,660 C968,662.209139 966.209139,664 964,664 L4,664 C1.790861,664 2.705415e-16,662.209139 0,660 L0,4 C-2.705415e-16,1.790861 1.790861,4.05812251e-16 4,0 Z"
                      ></path>
                      <g transform="translate(260.000000, 597.000000)" fill="currentColor" fill-rule="nonzero">
                        <g transform="translate(20.000000, 15.000000)">
                          <path
                            d="M11.8930012,2.16932373 L11.6729158,2.28818494 L11.4562163,2.42546126 L11.2462887,2.57445629 L1.08016611,10.1907564 C0.638165331,10.5218965 0.548294974,11.148651 0.879435054,11.5906518 C0.93859582,11.6696187 1.009118,11.739395 1.08870948,11.7977128 L11.8286685,19.6670321 L11.8286685,19.6670321 L12.0148946,19.7775228 C12.6582212,20.1290841 13.5047035,20.2630122 13.5351768,18.6223928 L13.528405,14.5878083 L20.2934917,19.6670321 L20.4797178,19.7775228 C21.1230443,20.1290841 21.9695266,20.2630122 22,18.6223928 L21.9779915,4.24353543 C21.9746055,1.91318621 21.1653684,1.777584 20.3578243,2.16932373 L20.1377389,2.28818494 L19.9210394,2.42546126 L19.7111118,2.57445629 L13.5148613,7.27198496 L13.5148613,4.24353543 C13.5097824,1.91318621 12.7022382,1.777584 11.8930012,2.16932373 Z"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div
              @click="state.progress === 0 ? undefined : setFast(-1)"
              class="image-player-tool-item"
              :class="{
                disabled: state.progress === 0,
              }"
            >
              <label>上一帧</label>
              <svg width="20px" height="20px" viewBox="0 0 20 20">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-387.000000, -765.000000)">
                    <g transform="translate(24.000000, 152.000000)">
                      <g transform="translate(260.000000, 597.000000)" fill="currentColor" fill-rule="nonzero">
                        <g transform="translate(102.000000, 15.000000)">
                          <path
                            d="M13.2133121,2.16932373 L12.9932267,2.28818494 L12.7765273,2.42546126 L12.5665996,2.57445629 L2.4004771,10.1907564 C1.95847632,10.5218965 1.86860596,11.148651 2.19974604,11.5906518 C2.25890681,11.6696187 2.32942899,11.739395 2.40902046,11.7977128 L13.1489795,19.6670321 L13.1489795,19.6670321 L13.3352056,19.7775228 C13.9785322,20.1290841 14.8250145,20.2630122 14.8554878,18.6223928 L14.8351723,4.24353543 C14.8300934,1.91318621 14.0225492,1.777584 13.2133121,2.16932373 Z M18.320311,2 C18.8725957,2 19.320311,2.44771525 19.320311,3 L19.320311,19 C19.320311,19.5522847 18.8725957,20 18.320311,20 C17.7680262,20 17.320311,19.5522847 17.320311,19 L17.320311,3 C17.320311,2.44771525 17.7680262,2 18.320311,2 Z"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div
              class="image-player-tool-item tool-item-play"
              :class="{
                'image-player-tool-item-disable': state.videoLoading,
              }"
              @click="state.isPlaying ? onSuspendClick() : onStartClick()"
            >
              <label>{{ state.videoLoading ? '加载中' : state.isPlaying ? '暂停' : '播放' }}</label>
              <svg
                v-if="!state.isPlaying"
                width="22px"
                height="22px"
                viewBox="0 0 22 22"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
              >
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-463.000000, -764.000000)" fill="#FFFFFF" fill-rule="nonzero">
                    <g transform="translate(24.000000, 152.000000)">
                      <g transform="translate(260.000000, 597.000000)">
                        <g transform="translate(179.000000, 15.000000)">
                          <path
                            d="M4,3.1242054 C4,2.12784222 4.60744233,1.71786622 5.35216195,2.20524712 L17.4407309,10.1149487 C18.1873949,10.6036797 18.1854505,11.39753 17.4407309,11.8844609 L5.35216195,19.7941624 C4.60549789,20.2828934 4,19.8715673 4,18.8752042 L4,3.1242054 Z"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
              <svg
                v-else
                width="21px"
                height="23px"
                viewBox="0 0 21 23"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
              >
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-302.000000, -951.000000)" fill="#FFFFFF" fill-rule="nonzero">
                    <g transform="translate(124.500000, 936.514930)">
                      <g transform="translate(178.000000, 15.000000)">
                        <path
                          d="M8.0952381,3.125 L8.0952381,18.875 C8.0952381,19.4960937 7.58333333,20 6.95238095,20 L3.14285714,20 C2.51190476,20 2,19.4960937 2,18.875 L2,3.125 C2,2.50390625 2.51190476,2 3.14285714,2 L6.95238095,2 C7.58333333,2 8.0952381,2.50390625 8.0952381,3.125 Z M18,3.125 L18,18.875 C18,19.4960937 17.4880952,20 16.8571429,20 L13.047619,20 C12.4166667,20 11.9047619,19.4960937 11.9047619,18.875 L11.9047619,3.125 C11.9047619,2.50390625 12.4166667,2 13.047619,2 L16.8571429,2 C17.4880952,2 18,2.50390625 18,3.125 Z"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div
              @click="state.progress === 1 ? undefined : setFast(1)"
              :class="{
                disabled: state.progress === 1,
              }"
              class="image-player-tool-item"
            >
              <label>下一帧</label>
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 20 20"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
              >
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-537.000000, -765.000000)">
                    <g transform="translate(24.000000, 152.000000)">
                      <g transform="translate(260.000000, 597.000000)" fill="currentColor" fill-rule="nonzero">
                        <g
                          transform="translate(263.000000, 26.000000) scale(-1, 1) translate(-263.000000, -26.000000) translate(252.000000, 15.000000)"
                        >
                          <path
                            d="M13.2133121,2.16932373 L12.9932267,2.28818494 L12.7765273,2.42546126 L12.5665996,2.57445629 L2.4004771,10.1907564 C1.95847632,10.5218965 1.86860596,11.148651 2.19974604,11.5906518 C2.25890681,11.6696187 2.32942899,11.739395 2.40902046,11.7977128 L13.1489795,19.6670321 L13.1489795,19.6670321 L13.3352056,19.7775228 C13.9785322,20.1290841 14.8250145,20.2630122 14.8554878,18.6223928 L14.8351723,4.24353543 C14.8300934,1.91318621 14.0225492,1.777584 13.2133121,2.16932373 Z M18.320311,2 C18.8725957,2 19.320311,2.44771525 19.320311,3 L19.320311,19 C19.320311,19.5522847 18.8725957,20 18.320311,20 C17.7680262,20 17.320311,19.5522847 17.320311,19 L17.320311,3 C17.320311,2.44771525 17.7680262,2 18.320311,2 Z"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div
              @click="setMultipySpeed(1)"
              class="image-player-tool-item"
              :class="{
                disabled: state.multipySpeed >= state.maxMulitpy,
              }"
            >
              <label>倍速+</label>
              <svg width="22px" height="22px" viewBox="0 0 22 22">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-618.000000, -764.000000)">
                    <g transform="translate(24.000000, 152.000000)">
                      <g transform="translate(260.000000, 597.000000)" fill="currentColor" fill-rule="nonzero">
                        <g
                          transform="translate(345.000000, 26.000000) scale(-1, 1) translate(-345.000000, -26.000000) translate(334.000000, 15.000000)"
                        >
                          <path
                            d="M11.8930012,2.16932373 L11.6729158,2.28818494 L11.4562163,2.42546126 L11.2462887,2.57445629 L1.08016611,10.1907564 C0.638165331,10.5218965 0.548294974,11.148651 0.879435054,11.5906518 C0.93859582,11.6696187 1.009118,11.739395 1.08870948,11.7977128 L11.8286685,19.6670321 L11.8286685,19.6670321 L12.0148946,19.7775228 C12.6582212,20.1290841 13.5047035,20.2630122 13.5351768,18.6223928 L13.528405,14.5878083 L20.2934917,19.6670321 L20.4797178,19.7775228 C21.1230443,20.1290841 21.9695266,20.2630122 22,18.6223928 L21.9779915,4.24353543 C21.9746055,1.91318621 21.1653684,1.777584 20.3578243,2.16932373 L20.1377389,2.28818494 L19.9210394,2.42546126 L19.7111118,2.57445629 L13.5148613,7.27198496 L13.5148613,4.24353543 C13.5097824,1.91318621 12.7022382,1.777584 11.8930012,2.16932373 Z"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>

            <!-- 倍速显示 -->
            <div v-show="state.multipySpeed !== 1" class="image-player-tool-speed">倍速 ×{{ state.multipySpeed }}</div>
          </div>
          <!-- 最大化 -->
          <div @click="onFullScreenClick" class="image-player-tool-maximize">
            <svg
              width="17px"
              height="17px"
              viewBox="0 0 17 17"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
            >
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g transform="translate(-132.000000, -609.000000)" fill="#878CC0" fill-rule="nonzero">
                  <g transform="translate(132.500000, 609.514955)">
                    <path
                      d="M1.58876326,4.85869049 C1.59088088,5.48172063 1.43820021,5.9978749 0.852253714,6.00001241 L0.847383187,6.00001241 C0.258048511,5.9993374 0.00160426791,5.48273315 1.60610891e-05,4.85599047 L1.60610895e-05,1.10707348 C-0.00151403432,0.813098164 0.107675361,0.530683108 0.303259088,0.322744604 C0.498842814,0.1148061 0.764573448,-0.00138209994 1.04125165,1.24093594e-05 L4.57983431,1.24093594e-05 C5.16895722,0.000851868464 5.64626961,0.283566699 5.6470125,0.90997187 C5.64775194,1.53311451 5.17329834,1.6896033 4.58735186,1.69039082 L2.01228799,1.69039082 C1.77838175,1.69039083 1.58876327,1.89186434 1.58876326,2.14039452 L1.58876326,4.85869049 Z M13.9876285,1.69029793 L11.4125578,1.69029793 C10.8266097,1.68962293 10.3522608,1.53313807 10.3528942,0.910011049 C10.3536372,0.283509085 10.8309509,0.000913842513 11.4200753,1.24093594e-05 L14.9627968,1.24093594e-05 C15.238761,-0.000260269742 15.5034271,0.116442353 15.6981156,0.324247544 C15.8928042,0.532052736 16.0014286,0.813789977 15.9999521,1.10699522 L15.9999521,4.85590713 C15.9983175,5.4825216 15.7418726,5.9992254 15.1526422,6.00001241 L15.1476658,6.00001241 C14.5617178,5.99776293 14.4091426,5.4816216 14.4111543,4.85860709 L14.4111543,2.14029034 C14.4111543,1.8917664 14.2215353,1.69029794 13.9876285,1.69029793 Z M4.58735041,14.3096992 C5.17329674,14.3103742 5.64775021,14.4669742 5.6470125,15.0899991 C5.64626786,15.7165115 5.16895562,15.9991114 4.57983286,16.0000124 L1.03712174,16.0000124 C0.761158255,16.0002856 0.496493002,15.883581 0.301804994,15.6757723 C0.107116986,15.4679637 -0.00150710538,15.1862218 1.57998655e-05,14.8930116 L1.57998643e-05,11.1441372 C0.00160400628,10.5173998 0.258048182,10.0006874 0.847382705,10.0000124 L0.852253231,10.0000124 C1.43819955,10.0022624 1.59077432,10.5182998 1.58876259,11.1413247 L1.58876259,13.8596993 C1.5887626,14.1082274 1.77838102,14.3096992 2.0122872,14.3096992 L4.58735041,14.3096992 Z M14.4111436,11.1414278 C14.409026,10.5182956 14.5617066,10.0022624 15.1476531,10.0000124 L15.1526295,10.0000124 C15.7418582,10.0007999 15.9983024,10.5175081 15.9998906,11.1441278 L15.9998906,14.8929698 C16.0014207,15.1869402 15.8922313,15.4693505 15.6966476,15.6772856 C15.5010639,15.8852206 15.2353333,16.0014069 14.9586552,16.0000124 L11.420073,16.0000124 C10.8309502,15.999173 10.3536378,15.7164628 10.3528942,15.0900681 C10.3522614,14.4669359 10.8266091,14.3104497 11.4125554,14.3096622 L13.987619,14.3096622 C14.2215252,14.3096622 14.4111436,14.108192 14.4111436,13.8596659 L14.4111436,11.1414278 Z"
                    ></path>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>

        <!-- 下方插件 -->
        <div class="image-player-plugin" v-if="state.isFullScreen" style="padding: 0">
          <!-- 预览图插件 -->
          <div class="image-player-preview-list">
            <!-- 注：先默认12张，回头逻辑我们再讨论 -->
            <div
              class="image-player-preview-item"
              @click="onPreviewClick(item.idx)"
              v-for="(item, i) in perviewImages"
              :key="i"
              :data-time="formatSeconds(fpsImageTimes[item.idx])"
              :class="{
                error: state.errorImages.find(x => x === item.url) !== undefined,
              }"
            >
              <img v-if="state.errorImages.find(x => x === item.url) === undefined" @error="onImageError(item.url)" :src="item.url ?? ''" />
            </div>

            <div
              :style="{
                transform: `translateX(${leftOffset}px)`,
              }"
              class="image-player-preview-progress"
            ></div>
          </div>
          <slot name="plugin" :currentTime="state.progress * state.videoDuration"></slot>
        </div>
      </div>
    </div>
    <!-- 下方插件 -->
    <div class="image-player-plugin" v-if="!state.isFullScreen">
      <!-- 预览图插件 -->
      <div class="image-player-preview-list">
        <!-- 注：先默认12张，回头逻辑我们再讨论 -->
        <div
          class="image-player-preview-item"
          @click="onPreviewClick(item.idx)"
          v-for="(item, i) in perviewImages"
          :key="i"
          :data-time="formatSeconds(fpsImageTimes[item.idx])"
          :class="{
            error: state.errorImages.find(x => x === item.url) !== undefined,
          }"
        >
          <img
            v-if="state.errorImages.find(x => x === item.url) === undefined && item.url !== undefined"
            @error="onImageError(item.url)"
            :src="item.url"
          />
        </div>

        <div
          :style="{
            transform: `translateX(${leftOffset}px)`,
          }"
          class="image-player-preview-progress"
        ></div>
      </div>
      <slot name="plugin" :leftWidth="leftOffset" :currentTime="state.progress * state.videoDuration"></slot>
    </div>
    <!-- 更多插件 -->
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, reactive, onUnmounted, PropType, nextTick, StyleValue } from 'vue';
import FpsPlayerController from './FpsPlayerController';
import FpsMeasure from './FpsMeasure.vue';
import gsap from 'gsap';

const videoRef = ref<HTMLVideoElement>();

/** 进度条的白色部分 */
const progressLineRef = ref<HTMLDivElement>();

/** 用于拖动的进度条的点 */
const progressDotRef = ref<HTMLDivElement>();

/** 播放器的最外层元素，用于全屏展示*/
const imagePlayerRef = ref<HTMLDivElement>();

/** 标注插件外面的框 */
const measureRef = ref<HTMLDivElement>();

const getVideoEl = () => videoRef.value!;

const emits = defineEmits<{
  /** 开始播放 */
  (event: 'start'): void;
  /** 暂停 */
  (event: 'suspend'): void;
  /** 进度条发生改变 */
  (event: 'change', value: number): void;
  /** 是否为视频模式 */
  (event: 'update:videoMode', value: boolean): void;
  /** 准备完毕 传递出控制器 */
  (event: 'ready', value: FpsPlayerController): void;
}>();

const props = defineProps({
  /** 播放的图片列表 */
  fpsImages: {
    type: Array as PropType<string[]>,
    default: () => [] as string[],
  },
  /** 视频的播放地址 */
  videoUrl: {
    type: String,
    default: () => '',
  },
  videoLoading: {
    type: Boolean,
    default: () => false,
  },
  maxCacheImgCount: {
    type: Number,
    default: () => 10,
  },
  /** 每张图片之间的间隔 秒 */
  fpsInterval: {
    type: Number,
    default: () => 1,
  },
  /** 默认的模式 */
  videoMode: {
    type: Boolean,
    default: () => false,
  },
  /** 是否开启测量 */
  measure: {
    type: Boolean,
    default: () => false,
  },
  /** 测量根据 */
  toolType: {
    type: String,
    default: () => '1',
  },
});

const state = reactive({
  /** 测量工具的大小 */
  measureWidth: 0,
  measureHeight: 0,
  /** 进度条宽度 */
  progressLineWidth: 0,
  /** 倍速的速度 */
  multipySpeed: 1,
  /** 是否正在播放 */
  isPlaying: false,
  /** 当前显示的帧数下标 */
  actFpsIdx: 0,
  /** 当前进度  0~1*/
  progress: 0,
  /** 进度条的小点被按下 */
  progressDotActive: false,
  /** 正在加载的图片地址 */
  loadingImageUrls: [] as string[],
  /** 已经缓存好的图片地址 */
  bufferImages: [] as string[],
  /** 加载失败的图片 */
  errorImages: [] as string[],
  /** 视频的时长 秒 */
  videoDuration: 0,
  /** 预览视频的下标 */
  previewFpsIdx: 0,
  /** 鼠标悬停在进度条上 */
  isHoveringProgress: false,
  /** 视频是否加载中 */
  videoLoading: false,
  /** 鼠标悬停的进度 */
  hoveringProgress: 0,
  /** 最大的倍速和最小倍速,需要是multipyStep的倍数 */
  maxMulitpy: 2,
  minMulitpy: 0.25,
  /** 进度条跳转中 需要根据这个参数给进度条移动添加动画 */
  isProgressJumping: false,
  /** 是否全屏 */
  isFullScreen: false,
});

/** 进度条点击的播放速度 毫秒*/
let transitionTime = 200;

/** 鼠标被按下的坐标 */
let pressMousePosX = 0;

/** 上次偏移的数量,用于计算第二次拖动的偏移 */
let beforeLeftOffset = 0;

/** 按下的小点的宽度 */
let progressDotWidth = 0;

/** 按下时候的播放状态 */
let prePlayIng = false;

/** 倍速每次点击增加减少的数量 */
const multipyStep = 0.25;

/** 加载防抖的计时器 */
let loadImgTimer: any;

/** 上一次回调触发的时间 , 通过这个参数大概可以计算出两次timeupdate的间距*/
let preTimeupdateTime = new Date().getTime();

/** 已经加载过的图片资源,里面的数据不会删除 */
const loadedImageUrls = [] as string[];

/** 进度条的动画控制器，启动下一个之前需要先关闭  */
let progressTween: gsap.core.Tween;

/** 处理过的图像列表如果图片数量和视频长度不一样就补全*/
const fillFpsImages = computed<string[]>(() => {
  if (props.fpsImages.length === 0) {
    return [];
  }
  const result: string[] = [];
  const count = Math.floor(state.videoDuration / props.fpsInterval);
  for (let i = 0; i < count; i++) {
    const item = props.fpsImages[i];
    if (!item) {
      result.push('');
    } else {
      result.push(item);
    }
  }
  return result;
});

/** 进度条左侧的偏移，根据总进度计算 */
const leftOffset = computed<number>(() => {
  const result = state.progress * state.progressLineWidth - progressDotWidth;
  const maxWidth = state.progressLineWidth - (state.isFullScreen ? 30 : 15);
  return result > maxWidth ? maxWidth : result;
});

/** 每一帧对应的时间 */
const fpsImageTimes = computed<number[]>(() => {
  return fillFpsImages.value.map((_, i) => i * props.fpsInterval);
});

/** 鼠标悬停左侧的偏移 */
const hoveringLeftOffset = computed<number>(() => {
  const result = state.hoveringProgress * state.progressLineWidth - 50;
  if (result <= 0) {
    return 0;
  }
  const max = state.progressLineWidth - 120;
  if (result >= max) {
    return max;
  }
  return result;
});

/** 地下的一排缩略图 */
const perviewImages = computed(() => {
  const result: {
    idx: number;
    url: string;
  }[] = [];
  const maxCount = Math.floor(state.videoDuration / props.fpsInterval);
  const count = maxCount < 12 ? maxCount : 12; // 缩略图的数量
  const step = fillFpsImages.value.length / count;
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(step * i) + 1;
    result.push({
      idx,
      url: fillFpsImages.value[idx] ?? '',
    });
  }
  return result;
});

/** 当前播放的进度 */
const currentTime = computed(() => {
  return formatSeconds(state.progress * state.videoDuration);
});

/** 当前帧数是否正在加载 */
const actFpsLoading = computed(() => {
  return state.loadingImageUrls.indexOf(fillFpsImages.value[state.actFpsIdx]) != -1;
});

/** 合并连续在一起的进度条，播放视频的时候就都显示一样的*/
const bufferProgress = computed<
  {
    flex: number;
    active: boolean;
  }[]
>(() => {
  if (props.videoMode) {
    return [
      {
        active: false,
        flex: 1,
      },
    ];
  }
  const result: {
    flex: number;
    active: boolean;
  }[] = [];
  let preIsActive: boolean | null = null;
  let preFlex = 0;
  let allFlex = 0;
  const len = fillFpsImages.value.length;
  for (let i = 0; i < len; i++) {
    const isActive = state.bufferImages.find(x => x == fillFpsImages.value[i]) !== undefined;
    if (preIsActive === isActive) {
      preFlex++;
    } else {
      if (preIsActive !== null) {
        result.push({
          active: preIsActive,
          flex: preFlex,
        });
        allFlex += preFlex;
      }
      if (preIsActive === null) {
        preFlex = 0;
      } else {
        preFlex = 1;
      }
    }
    preIsActive = isActive;
  }
  result.push({
    active: preIsActive!,
    flex: len - allFlex,
  });
  return result;
});

/** 切换视角 */
const switchVisual = () => {
  if (state.videoLoading) {
    return;
  }
  prePlayIng = state.isPlaying;
  state.videoLoading = true;
  getVideoEl().pause();
  setTimeout(() => {
    emits('update:videoMode', !props.videoMode);
    nextTick(() => {
      const videoEl = getVideoEl();
      videoEl.playbackRate = state.multipySpeed;
      const loadstart = () => {
        setTimeout(() => {
          playByProgress();
        }, 50);
        videoEl.removeEventListener('loadstart', loadstart);
      };
      videoEl.addEventListener('loadstart', loadstart);
    });
  }, 0);
};

/**
 * 处理加载失败的缩略图
 */
const onImageError = (url: string) => {
  if (state.errorImages.find(x => x === url) === undefined) {
    state.errorImages.push(url);
  }
};

/**
 * 当底部的缩略图被点击
 */
const onPreviewClick = (idx: number) => {
  const video = getVideoEl();
  video.pause();
  state.actFpsIdx = idx;
  setProgress();
  beforehandLoadImage();
  const onCanplay = () => {
    state.videoLoading = false;
    if (state.isPlaying) {
      video.play();
    }
    video.removeEventListener('canplay', onCanplay);
  };
  state.videoLoading = true;
  video.addEventListener('canplay', onCanplay);
  video.currentTime = state.progress * video.duration;
};

/**
 * 设置播放速度
 * @param direction 正数向前 负数向后
 */
const setMultipySpeed = (direction: number) => {
  let currentMulitpy = state.multipySpeed;
  if (direction > 0) {
    currentMulitpy += multipyStep;
  } else {
    currentMulitpy -= multipyStep;
  }
  if (currentMulitpy > state.maxMulitpy || currentMulitpy < state.minMulitpy) {
    return;
  }
  state.multipySpeed = currentMulitpy;
  getVideoEl().playbackRate = currentMulitpy;
};

/** 跳转到某一帧 */
const jumpToFps = (fps: number) => {
  let currentFps = state.actFpsIdx + fps;
  if (currentFps <= 0) {
    currentFps = 0;
  } else if (currentFps >= fillFpsImages.value.length - 1) {
    currentFps = fillFpsImages.value.length;
  }
  state.actFpsIdx = currentFps;
};

/**
 * 快进快退
 * @param direction 正数向前 负数向后
 */
const setFast = (direction: number) => {
  prePlayIng = state.isPlaying;
  getVideoEl().pause();
  nextTick(() => {
    jumpToFps(direction > 0 ? 1 : -1);
    if (state.actFpsIdx === 0) {
      setProgress(0);
    } else {
      setProgress();
    }
    beforehandLoadImage();
    nextTick(() => {
      playByProgress();
    });
  });
};

/** 把秒改成时分秒格式 */
const formatSeconds = (value: number): string => {
  let result = parseInt(value?.toString()) as any;
  const h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600);
  const m = Math.floor((result / 60) % 60) < 10 ? '0' + Math.floor((result / 60) % 60) : Math.floor((result / 60) % 60);
  const s = Math.floor(result % 60) < 10 ? '0' + Math.floor(result % 60) : Math.floor(result % 60);
  result = `${h}:${m}:${s}`;
  return result.indexOf('NaN') !== -1 ? '00:00:00' : result;
};
/**
 * 设置当前进度
 * @param progress 进度 0~1 为空就根据 actFpsIdx 计算进度
 */
const setProgress = (progress: number | null = null) => {
  if (progress != null) {
    state.progress = progress;
    return;
  }
  state.progress = state.actFpsIdx / fillFpsImages.value.length;
};

/**  重置播放状态*/
const resetPlayStatus = () => {
  progressTween?.kill();
  const video = getVideoEl();
  const onCanplay = () => {
    state.actFpsIdx = 0;
    state.isPlaying = false;
    state.progress = 0;
    video.removeEventListener('canplay', onCanplay);
  };
  video.addEventListener('canplay', onCanplay);
  video.currentTime = 0;
};

/** 开始 */
const onStartClick = () => {
  if (state.videoLoading) {
    return;
  }
  getVideoEl()
    .play()
    .then(() => {
      if (state.actFpsIdx >= fillFpsImages.value.length) {
        resetPlayStatus();
      }
      // emits('start');
      state.isPlaying = true;
    });
};

/** 暂停 */
const onSuspendClick = () => {
  progressTween?.kill();
  getVideoEl().pause();
  state.isPlaying = false;
};

/** 进度条被点击 */
const onProgressClick = (el: MouseEvent) => {
  if (state.videoLoading) {
    return;
  }
  state.videoLoading = true;
  state.isProgressJumping = true;
  setTimeout(() => {
    state.isProgressJumping = false;
  }, transitionTime);
  prePlayIng = state.isPlaying;
  const videoEl = getVideoEl();
  videoEl.pause();
  setTimeout(() => {
    onMouseMove(el, true);
    setTimeout(() => {
      playByProgress();
    }, 200);
  }, 0);
};

/** 保存按下的坐标 */
const onProgressDotMousedown = (el: MouseEvent) => {
  getVideoEl().pause();
  state.progressDotActive = true;
  beforeLeftOffset = leftOffset.value;
  pressMousePosX = el.clientX;
};

const onProgressMouseenter = (el: MouseEvent) => {
  if (!state.isHoveringProgress) {
    state.isHoveringProgress = true;
  }
};

const onProgressMouseout = (el: MouseEvent) => {
  if (state.isHoveringProgress) {
    state.isHoveringProgress = false;
  }
};

/** 通过进度设置下标 */
const setPreviewFpsByProgress = (progress: number) => {
  state.hoveringProgress = progress;
  state.previewFpsIdx = parseInt((progress * fillFpsImages.value.length).toString());
};

/** 通过和鼠标按下坐标来计算偏移量 */
const onMouseMove = (el: MouseEvent, setProgress = false) => {
  prePlayIng = state.isPlaying;
  const progress = (el.clientX - pressMousePosX + beforeLeftOffset + progressDotWidth / 2) / state.progressLineWidth;
  if (!state.progressDotActive) {
    // emits('hoverProgressChange', );
    if (state.isHoveringProgress) {
      setPreviewFpsByProgress(progress >= 1 ? 1 : progress);
    }
    if (!setProgress) {
      return;
    }
  }
  progressTween?.kill();
  if (progress >= 1) {
    onProgressChange(0.99);
  } else if (progress <= 0) {
    onProgressChange(0);
  } else {
    onProgressChange(progress);
  }
};

let resetLoadingTimer: NodeJS.Timeout;
let resetErrorTimer: NodeJS.Timeout;
/** 通过进度条播放 */
const playByProgress = () => {
  const videoEl = getVideoEl();
  const videoCanplay = () => {
    clearTimeout(resetLoadingTimer);
    resetLoadingTimer = setTimeout(() => {
      state.videoLoading = false;
    }, 200);
    if (prePlayIng) {
      videoEl.play();
    }
    state.isPlaying = prePlayIng;

    videoEl.removeEventListener('canplay', videoCanplay);
  };
  state.videoLoading = true;
  videoEl.addEventListener('canplay', videoCanplay);

  if (state.progress > 0.99) {
    state.progress = 1;
  }
  const currentTime = state.videoDuration * state.progress;
  if (isNaN(currentTime)) {
    clearTimeout(resetErrorTimer);
    resetErrorTimer = setTimeout(() => {
      playByProgress();
    }, 200);
  } else {
    videoEl.currentTime = currentTime;
  }
};

const onMouseup = () => {
  if (state.progressDotActive) {
    playByProgress();
  }
  state.progressDotActive = false;
};

/** 点击了全屏按钮 */
const onFullScreenClick = () => {
  const tempIsFullScreen = !state.isFullScreen;
  /**  如果直接修改状态会导致退出全屏的状态异常 */
  if (tempIsFullScreen) {
    imagePlayerRef.value?.requestFullscreen();
    setTimeout(() => {
      state.measureWidth = document.body.clientWidth;
      state.measureHeight = document.body.clientHeight;
    }, 200);
  } else {
    document.exitFullscreen();
  }
  setTimeout(() => {
    state.isFullScreen = tempIsFullScreen;
    nextTick(() => {
      setProgressWidth();
    });
  }, 200);
};

/** 设置进度条的宽度用于计算进度 */
const setProgressWidth = () => {
  state.progressLineWidth = progressLineRef.value!.clientWidth;
  progressDotWidth = progressDotRef.value!.clientWidth;
  state.measureHeight = measureRef.value?.clientHeight ?? 0;
  state.measureWidth = measureRef.value?.clientWidth ?? 0;
  // progressDotWidth = 14;
  // if (pressMousePosX === 0) {
  //   pressMousePosX = 40;
  // } else {
  //   pressMousePosX = progressLineRef.value!.offsetLeft + progressDotWidth + 20;
  // }
  pressMousePosX = progressLineRef.value!.getBoundingClientRect().left + progressDotWidth;
  // pressMousePosX = 50;
  getVideoDuration(props.videoUrl).then(res => {
    state.videoDuration = res;
  });
};

/**
 * 获取视频的时长
 * @param url 需要获取的视频地址
 */
const getVideoDuration = (url: string) => {
  return new Promise<number>(reslove => {
    let video = document.createElement('video') as any;
    video.preload = 'metadata';
    video.src = url;
    video.onloadedmetadata = () => {
      reslove(video.duration);
      video = null;
    };
  });
};

/**
 * 通过当前的进度设置当前播放的帧
 */
const setActIdxByProgress = () => {
  if (state.progress === 1) {
    state.actFpsIdx = fillFpsImages.value.length - 1;
    return;
  }
  const currentTime = state.progress * getVideoEl().duration;
  const arr = fpsImageTimes.value;
  /** 最近的下标 */
  state.actFpsIdx = arr.reduce((prev, curr) => {
    return arr.findIndex(x => x === (Math.abs(curr - currentTime) < Math.abs(prev - currentTime) ? curr : prev));
  });
};

/**
 * 设置下一帧的状态并 开启预先加载
 */
const setNextFpsState = () => {
  // state.actFpsIdx++;
  clearTimeout(loadImgTimer);
  if (state.progressDotActive) {
    loadImgTimer = setTimeout(() => {
      beforehandLoadImage();
    }, 500);
  } else {
    beforehandLoadImage();
  }
};

/**
 * 用来加载单张图片，并添标记图片加载完成
 * @param url 图片的完整地址
 */
const loadImage = (url: string) => {
  return new Promise(resolve => {
    /** 用来预加载图片的元素 */
    let beforehandLoadImageEl: HTMLImageElement | null = document.createElement('img');
    state.loadingImageUrls.push(url);
    beforehandLoadImageEl.setAttribute('src', url);
    beforehandLoadImageEl.onload = () => {
      state.loadingImageUrls = state.loadingImageUrls.filter(x => x != url);
      state.bufferImages.push(url);
      beforehandLoadImageEl = null;
      resolve(null);
    };
    beforehandLoadImageEl.onerror = () => {
      onImageError(url);
      beforehandLoadImageEl = null;
      resolve(null);
    };
  });
};

/**
 * 提前加载最大数量为 props.maxCacheImgCount 的图片
 */
const beforehandLoadImage = () => {
  const currentLoadImages: string[] = [];
  const actVideo = fillFpsImages.value;
  for (let i = state.actFpsIdx, loadCount = 0; i < actVideo.length && loadCount < props.maxCacheImgCount; i++, loadCount++) {
    const url = actVideo[i];
    if (loadedImageUrls.find(x => x === url) == null) {
      loadedImageUrls.push(url);
      currentLoadImages.push(url);
    }
  }
  if (currentLoadImages.length === 0) {
    return Promise.resolve([]);
  }
  return Promise.all(currentLoadImages.map(x => loadImage(x)));
};

/** 进度条发生改变 */
const onProgressChange = (progress: number) => {
  emits('change', state.progress * state.videoDuration);
  if (progress === 1) {
    resetPlayStatus();
    return;
  }
  setProgress(progress);
  setActIdxByProgress();
  if (!(state.actFpsIdx >= fillFpsImages.value.length - 1)) {
    setNextFpsState();
  }
};
let restartTimer: NodeJS.Timeout;
/**
 * 播放的进度发生改变
 */
const onVideoTimeupdate = (el: Event) => {
  clearTimeout(restartTimer);
  const videoEl = getVideoEl();
  const currentTime = new Date().getTime();
  transitionTime = currentTime - preTimeupdateTime;
  preTimeupdateTime = currentTime;
  if (transitionTime >= 300) {
    transitionTime = 200;
  }
  if (actFpsLoading.value && state.isPlaying) {
    onSuspendClick();
    clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
      onStartClick();
    }, 2000);
  }
  const targetProgress = videoEl.currentTime / state.videoDuration;
  progressTween?.kill();
  const current = { x: state.progress };
  progressTween = gsap.to(current, {
    x: targetProgress,
    duration: (transitionTime / 1000) * 0.9,
    ease: 'none',
    onUpdate() {
      onProgressChange(current.x);
    },
  });
};
/** 播放器是否全屏 */
const onFullscreenchange = () => {
  state.isFullScreen = document.fullscreenElement !== null; /*两个细节：使用document判断  能力测试*/
  nextTick(() => {
    setProgressWidth();
  });
};

/** 监听键盘的全屏快捷键，不知道为什么这个只有在打开的时候触发 */
const onKeydown = (el: KeyboardEvent) => {
  if (el.key !== 'F11') {
    return;
  }
  el.preventDefault();
  onFullScreenClick();
};

defineExpose<FpsPlayerController>({
  setProgress(progress: number) {
    prePlayIng = state.isPlaying;
    getVideoEl().pause();
    onProgressChange(progress);
    playByProgress();
  },
  setCurrentTime(time: number) {
    const video = getVideoEl();
    if (time > video.duration) {
      throw '设置时间不能大于视频时长';
    }
    this.setProgress(time / video.duration);
  },
  getProgress: () => state.progress,
  getCurrentTime: () => getVideoEl().currentTime,
});

onMounted(() => {
  setTimeout(() => {
    setProgressWidth();
    beforehandLoadImage();
  }, 500);

  window.addEventListener('resize', setProgressWidth);
  window.addEventListener('mouseup', onMouseup);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('fullscreenchange', onFullscreenchange);
  window.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  window.removeEventListener('resize', setProgressWidth);
  window.removeEventListener('mouseup', onMouseup);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('fullscreenchange', onFullscreenchange);
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style lang="less" scoped>
.image-player {
  color: #888cbc;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  user-select: none;
  display: flex;
  flex-direction: column;

  > .image-player-main {
    position: relative;
    width: 100%;
    padding: 10px;
    background-color: white;
    border-radius: 4px;
    flex-grow: 1;
    display: flex;
    flex-grow: 1;
    flex-direction: column;

    > .image-player-content {
      position: relative;
      // height: 500px;
      height: 0;
      flex-grow: 1;
      width: 100%;

      > .image-player-background {
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: 0;
        background-color: white;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        overflow: hidden;

        &:before {
          content: '';
          position: absolute;
          display: block;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          margin: 0;
          background-image: url(./assets/image-player-bg.png);
          background-position: center center;
          background-size: cover;
          border-radius: 6px;
        }

        &:after {
          content: '';
          position: absolute;
          display: block;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          margin: 0;
          background-image: url('./assets/logo.svg');
          background-position: center center;
          background-size: 20% 20%;
          background-repeat: no-repeat;
        }
      }

      > .image-player-main-title {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 12px;
        font-weight: 500;
        font-size: 14px;
        border-radius: 8px;
        color: #4b4d61;
        text-shadow: -0.5px 0.5px 0 white, 0.5px 0.5px 0 white, 0.5px -0.5px 0 white, -0.5px -0.5px 0 white;
      }

      > .image-player-content {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        background-color: black;

        > img,
        video {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      > .image-player-content-mini {
        position: absolute;
        top: 0px;
        right: 0px;
        margin: 8px;
        background-color: #c5c7e6;
        // 悬浮框宽度高度
        width: 166px;
        height: 94px;
        border-radius: 7px;
        z-index: 100;
        cursor: pointer;

        > .image-player-content-mini-title {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 6px 8px;
          font-size: 12px;
          color: white;
          text-shadow: -0.5px 0.5px 0 black, 0.5px 0.5px 0 black, 0.5px -0.5px 0 black, -0.5px -0.5px 0 black;
        }

        > video,
        img {
          position: absolute;
          border-radius: 7px;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background-color: black;
        }
      }

      > .image-player-content-plugin {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
      }

      > .image-player-content-tools {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        // display: none;
      }
    }

    > .image-player-controller {
      > .image-player-progress {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 5px 0px;
        margin-top: 10px;
        cursor: pointer;

        > .image-player-progress-time {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 5px;
          margin-bottom: 0px;

          > .image-player-progress-starttime {
            flex-shrink: 0;
            flex-grow: 0;
            font-size: 13px;
          }

          > .image-player-progress-endtime {
            flex-shrink: 0;
            flex-grow: 0;
            font-size: 13px;
          }
        }

        > .image-player-progress-track {
          position: relative;
          flex-shrink: 1;
          flex-grow: 1;
          width: 100%;
          height: 3px;
          border-radius: 3px;
          margin-left: 6px;
          margin-right: 6px;

          > .image-player-progress-track-pos {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 3px;
            display: flex;
            align-items: stretch;
            > .image-player-progress-track-not-loaded {
              width: 0;
              background-color: #c9c9c9;
            }

            > .image-player-progress-track-loaded {
              width: 0;
              background-color: #e7e7eb;
            }
          }

          > .image-player-progress-track-active {
            position: absolute;
            top: 0;
            left: 0;
            // 当前进度
            height: 100%;
            background-color: #aea6f9;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
          }

          > .image-player-progress-bar {
            cursor: grab;
            position: absolute;
            border: solid 4px #ffffff;
            box-sizing: border-box;
            width: 14px;
            height: 14px;
            border-radius: 15px;
            top: -6px;
            background-color: #7a67ff;
            box-shadow: 0px 0px 5px 1px rgba(107, 110, 195, 0.658);
            // 当前进度
            left: 3px;
            z-index: 100;
            > .image-player-progress-bar-time {
              cursor: default;
              position: absolute;
              display: block;
              width: 60px;
              top: -20px;
              left: 0px;
              right: 0px;
              color: white;
              white-space: nowrap;
              padding: 4px 6px;
              background-color: rgba(0, 0, 0, 0.4);
              border-radius: 2px;
              font-size: 12px;
              transform: translate(-45%, -50%) scale(0.9);
              opacity: 0;
            }

            &:hover {
              border-color: #eeeeee;
              > .image-player-progress-bar-time {
                opacity: 1;
              }
            }

            &:active {
              cursor: grabbing;
              box-shadow: 0px 0px 6px 2px rgba(107, 110, 195, 0.658);
            }
          }

          > .image-player-progress-bar-thumbnail {
            cursor: default;
            position: absolute;
            top: -90px;
            left: 0px;
            width: 120px;
            height: 80px;
            border-radius: 6px;

            z-index: 0;
            object-fit: cover;
          }
        }
      }

      > .image-player-toolpanel {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: -15px;

        > .image-player-tool-maximize {
          cursor: pointer;
          position: absolute;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          top: 16px;
          right: 0px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #f6f7fb;
          margin-right: 10px;

          &:hover {
            background-color: #eaedf8;
          }
        }

        > .image-player-tool-group {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          height: 50px;

          > .image-player-tool-speed {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            height: 50px;
            width: 100px;
            font-size: 13px;
            margin-right: -100px;
            color: #b5b8c7;
          }

          > .image-player-tool-item {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 6px;
            border-radius: 4px;

            &.disabled {
              cursor: not-allowed;

              > svg {
                cursor: not-allowed;
                color: #cccccc !important;
                transition: 0.3s;
              }
            }

            &:hover {
              > label {
                bottom: calc(100% + 10px);
                opacity: 1;
                visibility: visible;
              }

              > svg {
                color: #abaedd;
              }
            }

            &.tool-item-play {
              display: inline-flex;
              justify-content: center;
              align-items: center;
              width: 45px;
              height: 45px;
              background-color: #7a67ff;
              border-radius: 50%;
              transition: 0.15s;

              &:hover {
                background-color: #8c7cfc;
              }

              > svg {
                margin-left: 2px;
              }
            }

            + .image-player-tool-item {
              margin-left: 30px;
            }

            > label {
              position: absolute;
              bottom: calc(100%);
              color: white;
              transition: 0.15s;
              opacity: 0;
              font-size: 12px;
              background-color: rgba(0, 0, 0, 0.6);
              padding: 4px 10px;
              border-radius: 3px;
              white-space: nowrap;
              user-select: none;
              visibility: hidden;
            }

            > svg {
              cursor: pointer;
              color: #878cc0;
              transition: 0.3s;
            }
          }
          .image-player-tool-item-disable {
            background-color: gray !important;
            pointer-events: none;
            &:hover {
              cursor: not-allowed;
            }
          }
        }
      }
      &.full-screen {
        padding: 5px 10px;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: white;
        opacity: 0;
        transition: 200ms;
        border-radius: 8px;
        &:hover {
          opacity: 1;
        }
      }
    }
  }
}

.image-player-plugin {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 10px 0px;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  flex-direction: column;

  > .image-player-preview-list {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    height: 50px;
    width: 100%;

    > .image-player-preview-item {
      flex-flow: 1;
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
      background-color: #f2f3f9;

      transition: 0.3s;

      &:first-child {
        > img {
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
        }
      }

      &:nth-last-child(2) {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        > img {
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }
      }

      &:after {
        content: '';
        position: absolute;
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
        font-size: 12px;
        padding-right: 5px;
        padding-bottom: 3px;
        box-sizing: border-box;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        transition: 0.15s;
      }

      &:hover {
        transform: scale(1.3);
        z-index: 99;
        box-shadow: 0px 16px 16px 0px rgba(122, 103, 255, 0.2);
        border-radius: 4px;

        > img {
          border-radius: 4px;
        }

        &:after {
          content: attr(data-time);
          color: rgb(211, 211, 211);
        }
      }

      &.error {
        background-color: black;
        // &:after {
        //   content: 'error';
        //   color: #fe4444;
        //   font-size: 12px;
        //   background-color: rgba(255, 0, 0, 0.2);
        // }
      }

      > img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #f2f3f9;
        object-fit: cover;
      }
    }
    > .image-player-preview-progress {
      position: absolute;
      height: 100%;
      width: 1px;
      background-color: #7a67ff;
      margin-left: 6px;
    }
  }
}
.image-player-full {
  > .image-player-main {
    padding: 0;
  }
}
</style>
