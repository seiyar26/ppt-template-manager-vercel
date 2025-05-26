XHRPOST
https://mbwurtmvdgmnrizxfouf.supabase.co/storage/v1/object/ppt-templates/public/1748243165582-1748241484569-Rapport de progression.pptx
[HTTP/2 200  224ms]

XHROPTIONS
https://mbwurtmvdgmnrizxfouf.supabase.co/storage/v1/object/ppt-templates/public/1748243165582-1748241484569-Rapport de progression.pptx
[HTTP/2 200  207ms]

XHRPOST
https://mbwurtmvdgmnrizxfouf.supabase.co/rest/v1/ppt_templates?select=*
[HTTP/3 400  53ms]

XHROPTIONS
https://mbwurtmvdgmnrizxfouf.supabase.co/rest/v1/ppt_templates?select=*
[HTTP/2 200  15ms]

Erreur lors de la sauvegarde en base:
Object { code: "23502", details: "Failing row contains (46f07635-714b-49d3-9c27-ff55652c6d56, 1748241484569-Rapport de progression, Template uploadé le 26/05/2025 09:06:06, 1748243165582-1748241484569-Rapport de progression.pptx, null, 453602, application/vnd.openxmlformats-officedocument.presentationml.pre..., 1748241484569-Rapport de progression.pptx, null, null, null, null, 2025-05-26 07:06:06.044+00, 2025-05-26 07:06:06.044+00, https://mbwurtmvdgmnrizxfouf.supabase.co/storage/v1/object/publi..., null, null, pending, null, null, active).", hint: null, message: 'null value in column "file_path" of relation "ppt_templates" violates not-null constraint' }
main.7ffe600b.js:2:462562
Erreur Supabase: Error: Erreur base de données: null value in column "file_path" of relation "ppt_templates" violates not-null constraint
    uploadTemplate supabase-service.js:153
    onSubmit TemplateUpload.js:132
    React 6
main.7ffe600b.js:2:463363
XHRPOST
https://ppt-template-manager-1748240524-gdqyfhor6-seiyar26s-projects.vercel.app/api/templates/upload
[HTTP/2 500  1418ms]

Erreur lors de l'upload via API: Error: Échec de l'upload
    uploadTemplate supabase-service.js:212
    onSubmit TemplateUpload.js:132
    React 6
main.7ffe600b.js:2:463699
XHRPOST
https://ppt-template-manager-1748240524-gdqyfhor6-seiyar26s-projects.vercel.app/api/templates
[HTTP/2 201  1661ms]

XHRGET
https://ppt-template-manager-1748240524-gdqyfhor6-seiyar26s-projects.vercel.app/api/templates/07e02d4a-0a36-4133-a2c2-336009291c43
[HTTP/2 500  409ms]

Erreur de réponse API: 500
Object { error: {…} }
main.7ffe600b.js:2:277850
Erreur lors de la récupération du modèle 07e02d4a-0a36-4133-a2c2-336009291c43:
Object { message: "Request failed with status code 500", name: "AxiosError", code: "ERR_BAD_RESPONSE", config: {…}, request: XMLHttpRequest, response: {…}, status: 500, stack: "", … }
main.7ffe600b.js:2:280705
Erreur lors de la récupération du modèle:
Object { message: "Request failed with status code 500", name: "AxiosError", code: "ERR_BAD_RESPONSE", config: {…}, request: XMLHttpRequest, response: {…}, status: 500, stack: "", … }
main.7ffe600b.js:2:474593
Message d'erreur: Request failed with status code 500 main.7ffe600b.js:2:474663
