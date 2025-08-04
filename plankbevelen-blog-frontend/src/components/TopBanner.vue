<template>
    <div class="top-banner" :style="{ height: height, backgroundImage: `url(${imagePath})`}">
        <span class="title"> {{ title }} </span>
        <canvas class="wave" id="wave"></canvas>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { defineProps, nextTick, onMounted, computed } from 'vue';
import { useTheme } from '@/stores/useTheme';

const props = defineProps({
    imagePath: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    height: {
        type: String,
        default: '100vh'
    }
});

const themeStore = useTheme();

// 根据主题动态设置波浪颜色
const waveColors = computed(() => {
    const baseColor = themeStore.isDark ? '#1a1a1a' : '#fff';
    return [
        `rgba(${hexToRgb(baseColor)}, 0.6)`,
        `rgba(${hexToRgb(baseColor)}, 1)`,
        `rgba(${hexToRgb(baseColor)}, 0.7)`,
        `rgba(${hexToRgb(baseColor)}, 0.5)`
    ];
});

// 将十六进制颜色转换为RGB
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '255, 255, 255'; // 默认白色
};

const oninitCanvas = () => {
    nextTick(() => {
        const canvas = document.getElementById('wave');
        if (!canvas) {
            console.error('无法获取到 canvas 元素');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const canvasHeight = canvas.offsetHeight;
        const canvasWidth = canvas.offsetWidth;
        
        // 设置canvas物理尺寸，避免模糊
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // 优化后的波浪参数
        const waveCount = 4; // 波浪层数

        const waveSpeeds = [1.0, 1.25, 0.85, 0.5]
        const maxAmplitude = canvasHeight / 2.64;
        const waveYPosition = canvasHeight / 1.08; 
        
        const requestAnimFrame = window.requestAnimationFrame || 
                                window.webkitRequestAnimationFrame || 
                                window.mozRequestAnimationFrame || 
                                function(callback) {
                                    setTimeout(callback, 1000 / 60);
                                };
        
        let animationId = null;
        let step = 0;
        
        // 绘制波浪的函数
        const drawWaves = () => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            step++;
            for (let j = 0; j < waveCount; j++) {
                const speedFactor = waveSpeeds[j];
                const phase = j * 250;
                const animatedStep = step * speedFactor + phase;
                const angle = (animatedStep) * Math.PI / 180;
                

                const amplitude = maxAmplitude * (0.8 + j * 0.2 / waveCount);
                
                const deltaHeight = Math.sin(angle) * amplitude;
                const deltaHeightRight = Math.cos(angle) * amplitude;
                
                ctx.fillStyle = waveColors.value[j];
                
                ctx.beginPath();
                ctx.moveTo(0, waveYPosition + deltaHeight);
                
                const controlPoint1Y = waveYPosition + deltaHeight - amplitude * 1.3;
                const controlPoint2Y = waveYPosition + deltaHeightRight - amplitude * 1.3;
                
                ctx.bezierCurveTo(
                    canvasWidth / 2, controlPoint1Y,
                    canvasWidth * 2 / 3, controlPoint2Y,
                    canvasWidth, waveYPosition + deltaHeightRight
                );
                
                ctx.lineTo(canvasWidth, canvasHeight);
                ctx.lineTo(0, canvasHeight);
                ctx.closePath();
                ctx.fill();
            }
            
            animationId = requestAnimFrame(drawWaves);
        };
        
        drawWaves();
    }); 
}

onMounted(() => {
    oninitCanvas();
})
</script>

<style scoped lang="less">
.top-banner {
    position: relative;
    background-size: cover;
    width: 100%;
    overflow: hidden;
    object-fit: cover;
    background-position: center;

    .title {
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--text-light-color);
        font-size: 2.8rem;
        font-weight: 400;
        letter-spacing: 0.1rem;
        font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    }

    .wave {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 12%;
        z-index: 10;
    }

    @media (min-height: 780px) {
        .wave {
            min-height: 6vh;
        }
    }
}

</style>