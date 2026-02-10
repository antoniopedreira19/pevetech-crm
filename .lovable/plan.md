
## Corrigir logos cortados na seção de prova social

O problema é que `object-cover` recorta as imagens para preencher o circulo, cortando logos que não são quadradas (como VV Benefícios e MTwelve).

### Solução

Trocar `object-cover` por `object-contain` e adicionar um pequeno padding interno para que a imagem inteira caiba dentro do círculo sem ser cortada.

### Alteração em `src/pages/Index.tsx`

Na linha da tag `<img>`, mudar de:
```
className="w-full h-full object-cover"
```
para:
```
className="w-full h-full object-contain p-1.5"
```

Isso garante que todas as logos fiquem completamente visíveis dentro do círculo, independentemente da proporção original da imagem.
