<template>
    <TopBanner :title="article?.title || ''" :imagePath="article?.cover || ''" height="35vh">
        <div class="article-detail-header">
            <span class="created-at">
                <svg-icon name="calendar" size="16px" color="var(--text-light-color)"/>
                {{ formatDatetime(article?.created_at || '') }}
            </span>
            <span class="updated-at">
                <svg-icon name="clock" size="15px" color="var(--text-light-color)"/>
                {{ formatDatetime(article?.updated_at || '') }}
            </span>
            <span class="category">
                <svg-icon name="category" size="16px" color="var(--text-light-color)"/>
                {{ article?.category_id ? articleStore.getCategoryNameById(article.category_id) : '' }}
            </span>
            <span class="tags">
                <svg-icon name="tag" size="16px" color="var(--text-light-color)"/>
                {{ article?.tags?.map(tag => tag).join('、 ') }}
            </span>
            <span class="score">
                <svg-icon name="score" size="16px" color="var(--text-light-color)"/>
                {{ article?.average_score || 0 }}
            </span>
            <span class="comments">
                <svg-icon name="comment" size="16px" color="var(--text-light-color)"/>
                {{ article?.comments_count }}
            </span>
            <span class="views">
                <svg-icon name="view" size="16px" color="var(--text-light-color)"/>
                {{ article?.views_count }}
            </span>
        </div>
    </TopBanner>
    <div class="article-detail">
        <div class="container">   
            <div class="article-detail__content">
                <div class="markdown-content card
                ">
                    <MdPreview 
                        editorId="article-detail-preview"
                        :modelValue="article?.content || ''"    
                        previewTheme="default"
                        codeTheme="github"
                        showCodeRowNumber
                        :mdHeadingId="mdHeadingId"
                        @onGetCatalog="onGetCatalog"
                        scrollAuto
                        
                    />
                </div>

                <div class="markdown-catalog card">
                    <h4 class="catalog-title">
                        <svg-icon name="list" size="16px" />
                        目录
                    </h4>
                    <MdCatalog 
                        editorId="article-detail-preview"
                        :mdHeadingId="mdHeadingId"
                        :scrollElement="scrollElement"
                        scrollAuto
                        v-if="catalogList.length > 0"
                    />
                    <div v-else class="no-catalog">
                        <p>暂无目录</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import TopBanner from '@/components/TopBanner.vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { ArticleCreateRequest } from '@/types/article'
import articleService from '@/services/article.service'
import { MdEditor, MdCatalog, MdPreview } from 'md-editor-v3'
import { formatDatetime } from '@/utils/format'
import 'md-editor-v3/lib/style.css'
import { useArticleStore } from '@/stores/article';

const route = useRoute()
const articleStore = useArticleStore()

const articleId = computed(() => {
    const id = route.query.id
    return Array.isArray(id) ? Number(id[0]) : Number(id)
})

const loading = ref<boolean>(false)
const article = ref<ArticleCreateRequest | null>(null)
const catalogList = ref<any>([])
const scrollElement = document.documentElement

const mdHeadingId = (text: string, level: number, index: number) => {
  return `heading-${level}-${index}`
}

const onGetCatalog = (list: any[]) => {
  catalogList.value = list
}

async function getArticleDetail(id: number) {
    loading.value = false
    const res = await articleService.getArticleDetail(id)
    if (res.status === 200) {
        article.value = res.data[0]
    }
    console.log(article.value?.content)

    loading.value = true
}

onMounted(async () => { 
    await getArticleDetail(articleId.value)
    await articleStore.initArticleStore()
})

</script>

<style lang="less" scoped src="@/assets/styles/pages/article-detail.less" />
    