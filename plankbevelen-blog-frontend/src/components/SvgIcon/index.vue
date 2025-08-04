<template>
    <svg class="svg-icon" :style="{ color: color, width: size, height: size }" aria-hidden="true" >
        <use :xlink:href="symbolId"></use>
    </svg>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = defineProps({
    prefix: {
        type: String,
        default: 'icon',
    },
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: '#fff'
    },
    size: {
        type: String,
        default: '1em'
    }
})

const symbolId = computed(() => {
    return `#${props.prefix}-${props.name}`
})

</script>

<style scoped lang="less">
.svg-icon {
    width: 1em;
    height: 1em;
    fill: currentColor;
    vertical-align: middle;
    outline: none;
    overflow: hidden;
    
}
</style>
