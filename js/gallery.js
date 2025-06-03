document.addEventListener('DOMContentLoaded', () => {
  const galleryTabs = document.querySelectorAll('.gallery-tab-button');
  const galleryContentWrapper = document.querySelector('.gallery-attribute-content-wrapper');
  const galleryCardPlaceholders = document.querySelectorAll('.gallery-card-placeholder');
  const galleryEnlargedCard = document.querySelector('.gallery-enlarged-card-placeholder');
  const galleryCardEffectText = document.getElementById('gallery-card-effect-text');

  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // すべてのタブからactiveクラスを削除
      galleryTabs.forEach(t => t.classList.remove('gallery-active'));
      // クリックされたタブにactiveクラスを追加
      tab.classList.add('gallery-active');

      const attributeIndex = parseInt(tab.dataset.attributeIndex);
      // コンテンツエリアをスライド
      // translateXの値は- (index * (100 / numberOfTabs)) %
      // ここでは5つのタブがあるので、各ステップは20%
      galleryContentWrapper.style.transform = `translateX(-${attributeIndex * 20}%)`;

      // タブが変わったら拡大カードとカード効果をリセット
      galleryEnlargedCard.textContent = '拡大カード';
      galleryCardEffectText.textContent = 'ここに選択したカードの効果が表示されます。';
    });
  });

  galleryCardPlaceholders.forEach(card => {
    card.addEventListener('click', () => {
      const cardId = card.dataset.galleryCardId || card.textContent;
      galleryEnlargedCard.textContent = cardId;
      // TODO: jsonを作りカードidから正確なカード効果を取得（今は固定）
      galleryCardEffectText.textContent = `「${cardId}」のカード効果：詳細な効果テキストはここに表示されます。このカードはとても強力で、特別なアビリティを持っています。`;
    });
  });
});