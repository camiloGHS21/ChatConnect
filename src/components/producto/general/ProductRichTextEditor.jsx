import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import { localizeProductQuill } from './productQuillLocale';
import 'react-quill-new/dist/quill.snow.css';
import './product-quill.css';

/** Localiza únicamente la interfaz de Quill, nunca el contenido del documento. */
const ProductRichTextEditor = ({ label, ...props }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const quill = editorRef.current?.getEditor();
    if (!quill) return;
    const toolbar = props.modules?.toolbar === false ? null : quill.getModule('toolbar')?.container;
    const tooltip = quill.theme.tooltip?.root;
    quill.root.setAttribute('aria-label', label);
    quill.root.setAttribute('role', 'textbox');
    quill.root.setAttribute('aria-multiline', 'true');
    quill.root.setAttribute('lang', 'es');

    const localize = () => localizeProductQuill(toolbar, tooltip);
    localize();
    // Quill actualiza los selectores y el modo del enlace al cambiar la selección.
    const observer = new MutationObserver(localize);
    [toolbar, tooltip].filter(Boolean).forEach((element) => {
      observer.observe(element, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-value', 'data-label', 'data-mode', 'class'],
      });
    });
    const onTooltipKeyDown = (event) => {
      if (event.target.matches('a.ql-action, a.ql-remove') &&
          (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.target.click();
      }
    };
    tooltip?.addEventListener('keydown', onTooltipKeyDown);
    return () => {
      observer.disconnect();
      tooltip?.removeEventListener('keydown', onTooltipKeyDown);
    };
  }, [label, props.modules]);

  return <ReactQuill ref={editorRef} {...props} />;
};

export default ProductRichTextEditor;
