# 构建与配置：逐文件源码索引

wmake、环境脚本、代码模板和构建清单。

- 文件数：92
- 基线：`OpenFOAM-14@20260724`
- 说明：索引按真实源码路径排序；文件卡名包含路径哈希，用于规避大小写冲突。

| 源码路径 | 类型 | 行数 | 文件解析 |
|---|---|---:|---|
| `etc/caseDicts/general/workflow/Allclean` | 脚本 | 22 | [打开](files/ca/allclean--ca2ad3700265.md) |
| `etc/caseDicts/general/workflow/Allmesh` | 脚本 | 19 | [打开](files/e2/allmesh--e2ea961342c4.md) |
| `etc/caseDicts/general/workflow/Allrun` | 脚本 | 26 | [打开](files/ab/allrun--ab10f0fec03a.md) |
| `etc/codeTemplates/app/app.C` | C/C++ 或词法/语法源文件 | 63 | [打开](files/2f/app.c--2fb06e9a5911.md) |
| `etc/codeTemplates/app/createFields.H` | C/C++ 或词法/语法源文件 | 20 | [打开](files/a6/createfields.h--a6f7f2984f9d.md) |
| `etc/codeTemplates/app/Make/files` | 构建/运行清单 | 8 | [打开](files/8f/files--8fec4952dbf4.md) |
| `etc/codeTemplates/app/Make/options` | 构建/运行清单 | 12 | [打开](files/4d/options--4d5fa6b7a726.md) |
| `etc/codeTemplates/BC/BC.C` | C/C++ 或词法/语法源文件 | 221 | [打开](files/c8/bc.c--c8da537d9e35.md) |
| `etc/codeTemplates/BC/BC.H` | C/C++ 或词法/语法源文件 | 232 | [打开](files/12/bc.h--123987a91adb.md) |
| `etc/codeTemplates/BC/BCs.C` | C/C++ 或词法/语法源文件 | 48 | [打开](files/bc/bcs.c--bc26da0b3edc.md) |
| `etc/codeTemplates/BC/BCs.H` | C/C++ 或词法/语法源文件 | 55 | [打开](files/48/bcs.h--48b43b758782.md) |
| `etc/codeTemplates/BC/BCsFwd.H` | C/C++ 或词法/语法源文件 | 56 | [打开](files/b0/bcsfwd.h--b0221e616a11.md) |
| `etc/codeTemplates/BC/Make/files` | 构建/运行清单 | 8 | [打开](files/48/files--4880d7d11b84.md) |
| `etc/codeTemplates/BC/Make/options` | 构建/运行清单 | 12 | [打开](files/d1/options--d193983d3c44.md) |
| `etc/codeTemplates/dynamicCode/bRhoMulticomponentThermoTemplate.C` | C/C++ 或词法/语法源文件 | 113 | [打开](files/ea/brhomulticomponentthermotemplate.c--ea8fcffc7a70.md) |
| `etc/codeTemplates/dynamicCode/chemistryModelTemplate.C` | C/C++ 或词法/语法源文件 | 239 | [打开](files/77/chemistrymodeltemplate.c--77a8d58b02c2.md) |
| `etc/codeTemplates/dynamicCode/codeBlockTemplate.C` | C/C++ 或词法/语法源文件 | 86 | [打开](files/b9/codeblocktemplate.c--b9323c83281c.md) |
| `etc/codeTemplates/dynamicCode/codedDimensionedFieldFunctionTemplate.C` | C/C++ 或词法/语法源文件 | 190 | [打开](files/17/codeddimensionedfieldfunctiontemplate.c--17a3216caef0.md) |
| `etc/codeTemplates/dynamicCode/codedDimensionedFieldFunctionTemplate.H` | C/C++ 或词法/语法源文件 | 131 | [打开](files/6c/codeddimensionedfieldfunctiontemplate.h--6c5bd915bbd3.md) |
| `etc/codeTemplates/dynamicCode/codedFixedValueFvPatchFieldTemplate.C` | C/C++ 或词法/语法源文件 | 182 | [打开](files/59/codedfixedvaluefvpatchfieldtemplate.c--59c7b9ae355c.md) |
| `etc/codeTemplates/dynamicCode/codedFixedValueFvPatchFieldTemplate.H` | C/C++ 或词法/语法源文件 | 138 | [打开](files/31/codedfixedvaluefvpatchfieldtemplate.h--31736463a0cc.md) |
| `etc/codeTemplates/dynamicCode/codedFixedValuePointPatchFieldTemplate.C` | C/C++ 或词法/语法源文件 | 181 | [打开](files/13/codedfixedvaluepointpatchfieldtemplate.c--13c5d36053f7.md) |
| `etc/codeTemplates/dynamicCode/codedFixedValuePointPatchFieldTemplate.H` | C/C++ 或词法/语法源文件 | 138 | [打开](files/41/codedfixedvaluepointpatchfieldtemplate.h--412752e85107.md) |
| `etc/codeTemplates/dynamicCode/codedFunction1Template.C` | C/C++ 或词法/语法源文件 | 150 | [打开](files/60/codedfunction1template.c--607d2335824c.md) |
| `etc/codeTemplates/dynamicCode/codedFunction1Template.H` | C/C++ 或词法/语法源文件 | 139 | [打开](files/ce/codedfunction1template.h--ced06dbf38b6.md) |
| `etc/codeTemplates/dynamicCode/codedFunction2Template.C` | C/C++ 或词法/语法源文件 | 141 | [打开](files/6b/codedfunction2template.c--6bcc5e1b2da1.md) |
| `etc/codeTemplates/dynamicCode/codedFunction2Template.H` | C/C++ 或词法/语法源文件 | 136 | [打开](files/f1/codedfunction2template.h--f1463e0b3bb4.md) |
| `etc/codeTemplates/dynamicCode/codedFunctionObjectTemplate.C` | C/C++ 或词法/语法源文件 | 192 | [打开](files/7b/codedfunctionobjecttemplate.c--7b38910bee39.md) |
| `etc/codeTemplates/dynamicCode/codedFunctionObjectTemplate.H` | C/C++ 或词法/语法源文件 | 133 | [打开](files/8f/codedfunctionobjecttemplate.h--8fbcfdb55985.md) |
| `etc/codeTemplates/dynamicCode/codedFvModelTemplate.C` | C/C++ 或词法/语法源文件 | 217 | [打开](files/de/codedfvmodeltemplate.c--de39f0655690.md) |
| `etc/codeTemplates/dynamicCode/codedFvModelTemplate.H` | C/C++ 或词法/语法源文件 | 148 | [打开](files/c9/codedfvmodeltemplate.h--c90606e77edd.md) |
| `etc/codeTemplates/dynamicCode/codeDictTemplate.C` | C/C++ 或词法/语法源文件 | 79 | [打开](files/c4/codedicttemplate.c--c40ee504164b.md) |
| `etc/codeTemplates/dynamicCode/codedMixedFvPatchFieldTemplate.C` | C/C++ 或词法/语法源文件 | 182 | [打开](files/6c/codedmixedfvpatchfieldtemplate.c--6c3047ba04b2.md) |
| `etc/codeTemplates/dynamicCode/codedMixedFvPatchFieldTemplate.H` | C/C++ 或词法/语法源文件 | 138 | [打开](files/e3/codedmixedfvpatchfieldtemplate.h--e306ec8477c3.md) |
| `etc/codeTemplates/dynamicCode/codedZoneGeneratorTemplate.C` | C/C++ 或词法/语法源文件 | 161 | [打开](files/0c/codedzonegeneratortemplate.c--0cb1dcd471dc.md) |
| `etc/codeTemplates/dynamicCode/codedZoneGeneratorTemplate.H` | C/C++ 或词法/语法源文件 | 108 | [打开](files/13/codedzonegeneratortemplate.h--131601d49fc1.md) |
| `etc/codeTemplates/dynamicCode/codeStreamTemplate.C` | C/C++ 或词法/语法源文件 | 79 | [打开](files/89/codestreamtemplate.c--896b82f52767.md) |
| `etc/codeTemplates/dynamicCode/fluidMulticomponentThermoTemplate.C` | C/C++ 或词法/语法源文件 | 113 | [打开](files/cf/fluidmulticomponentthermotemplate.c--cf2e652730ee.md) |
| `etc/codeTemplates/dynamicCode/fluidThermoTemplate.C` | C/C++ 或词法/语法源文件 | 113 | [打开](files/90/fluidthermotemplate.c--904631401123.md) |
| `etc/codeTemplates/dynamicCode/solidThermoTemplate.C` | C/C++ 或词法/语法源文件 | 105 | [打开](files/20/solidthermotemplate.c--207098d95ee2.md) |
| `etc/codeTemplates/dynamicCode/uRhoMulticomponentThermoTemplate.C` | C/C++ 或词法/语法源文件 | 113 | [打开](files/3e/urhomulticomponentthermotemplate.c--3e42e0bd4844.md) |
| `etc/codeTemplates/foamScript` | 脚本 | 37 | [打开](files/89/foamscript--89249971ad94.md) |
| `etc/codeTemplates/functionObject/FUNCTIONOBJECT.C` | C/C++ 或词法/语法源文件 | 110 | [打开](files/93/functionobject.c--93741a85a484.md) |
| `etc/codeTemplates/functionObject/FUNCTIONOBJECT.H` | C/C++ 或词法/语法源文件 | 156 | [打开](files/e5/functionobject.h--e57e10e8d4ca.md) |
| `etc/codeTemplates/functionObject/Make/files` | 构建/运行清单 | 8 | [打开](files/1a/files--1af140ddbbfb.md) |
| `etc/codeTemplates/functionObject/Make/options` | 构建/运行清单 | 12 | [打开](files/dc/options--dcc4da4ad3db.md) |
| `etc/codeTemplates/plain/Make/files` | 构建/运行清单 | 8 | [打开](files/f0/files--f0051cbd6831.md) |
| `etc/codeTemplates/plain/Make/options` | 构建/运行清单 | 10 | [打开](files/ba/options--ba2061347890.md) |
| `etc/codeTemplates/plain/plain.C` | C/C++ 或词法/语法源文件 | 87 | [打开](files/c3/plain.c--c38fbccb1d07.md) |
| `etc/codeTemplates/solver/Make/files` | 构建/运行清单 | 8 | [打开](files/fd/files--fdc0a3a618e2.md) |
| `etc/codeTemplates/solver/SOLVER.C` | C/C++ 或词法/语法源文件 | 133 | [打开](files/37/solver.c--37601d313884.md) |
| `etc/codeTemplates/solver/SOLVER.H` | C/C++ 或词法/语法源文件 | 167 | [打开](files/c4/solver.h--c4ea9263dea1.md) |
| `etc/codeTemplates/source/_Template.C` | C/C++ 或词法/语法源文件 | 108 | [打开](files/3b/_template.c--3bdd83ea4b11.md) |
| `etc/codeTemplates/source/_Template.H` | C/C++ 或词法/语法源文件 | 157 | [打开](files/0a/_template.h--0a862faa39fa.md) |
| `etc/codeTemplates/source/_TemplateApp.C` | C/C++ 或词法/语法源文件 | 57 | [打开](files/ba/_templateapp.c--ba0f7765aa26.md) |
| `etc/codeTemplates/source/_TemplateI.H` | C/C++ 或词法/语法源文件 | 64 | [打开](files/6c/_templatei.h--6cb7b92349ac.md) |
| `etc/codeTemplates/source/_TemplateIO.C` | C/C++ 或词法/语法源文件 | 76 | [打开](files/1d/_templateio.c--1d7a53f0fa0f.md) |
| `etc/codeTemplates/source/foamNewSource` | 脚本 | 122 | [打开](files/9f/foamnewsource--9f7f13691e0f.md) |
| `etc/codeTemplates/template/_TemplateTemplate.C` | C/C++ 或词法/语法源文件 | 125 | [打开](files/61/_templatetemplate.c--6193729a3728.md) |
| `etc/codeTemplates/template/_TemplateTemplate.H` | C/C++ 或词法/语法源文件 | 163 | [打开](files/e6/_templatetemplate.h--e683be341d91.md) |
| `etc/codeTemplates/template/_TemplateTemplateI.H` | C/C++ 或词法/语法源文件 | 64 | [打开](files/72/_templatetemplatei.h--72e06fcc2081.md) |
| `etc/codeTemplates/template/_TemplateTemplateIO.C` | C/C++ 或词法/语法源文件 | 88 | [打开](files/0b/_templatetemplateio.c--0b928499e2de.md) |
| `etc/codeTemplates/template/foamNewTemplate` | 脚本 | 137 | [打开](files/20/foamnewtemplate--20965bb6438d.md) |
| `etc/config.sh/example/prefs.sh` | 脚本 | 73 | [打开](files/9c/prefs.sh--9c7d61bfa86e.md) |
| `etc/templates/axisymmetricJet/Allclean` | 脚本 | 13 | [打开](files/ca/allclean--caa72bfb4090.md) |
| `etc/templates/axisymmetricJet/Allrun` | 脚本 | 16 | [打开](files/5f/allrun--5fdbcd4fb81f.md) |
| `etc/templates/nonConformalCHT/Allclean` | 脚本 | 32 | [打开](files/9d/allclean--9db1875aa62a.md) |
| `etc/templates/nonConformalCHT/Allmesh` | 脚本 | 38 | [打开](files/97/allmesh--97b1d24b2adc.md) |
| `etc/templates/nonConformalCHT/Allrun` | 脚本 | 18 | [打开](files/f0/allrun--f0a74de710e1.md) |
| `etc/templates/singleFluidCHT/Allclean` | 脚本 | 32 | [打开](files/ad/allclean--ad2b37c2342a.md) |
| `etc/templates/singleFluidCHT/Allmesh` | 脚本 | 17 | [打开](files/23/allmesh--23f145c89c74.md) |
| `etc/templates/singleFluidCHT/Allrun` | 脚本 | 18 | [打开](files/c8/allrun--c8885dcb8916.md) |
| `wmake/scripts/makeFiles` | 脚本 | 85 | [打开](files/23/makefiles--23609f0dfe06.md) |
| `wmake/scripts/makeOptions` | 脚本 | 56 | [打开](files/31/makeoptions--3174ea64e673.md) |
| `wmake/scripts/makeTargetDir` | 脚本 | 46 | [打开](files/2c/maketargetdir--2c6e56ec7b02.md) |
| `wmake/scripts/wmakeFunctions` | 脚本 | 157 | [打开](files/d1/wmakefunctions--d134363825c4.md) |
| `wmake/src/dirToString.c` | C/C++ 或词法/语法源文件 | 83 | [打开](files/11/dirtostring.c--11905b6f5ec7.md) |
| `wmake/wclean` | 脚本 | 301 | [打开](files/b2/wclean--b2960f763067.md) |
| `wmake/wcleanLnIncludeAll` | 脚本 | 97 | [打开](files/0a/wcleanlnincludeall--0a14c933e878.md) |
| `wmake/wcleanPlatform` | 脚本 | 140 | [打开](files/66/wcleanplatform--662d1106389a.md) |
| `wmake/wdep` | 脚本 | 129 | [打开](files/09/wdep--09a242835af5.md) |
| `wmake/wmake` | 脚本 | 496 | [打开](files/20/wmake--2062c7fbda00.md) |
| `wmake/wmakeCheckPwd` | 脚本 | 131 | [打开](files/de/wmakecheckpwd--de7a19243d75.md) |
| `wmake/wmakeCollect` | 脚本 | 181 | [打开](files/a1/wmakecollect--a141e7778857.md) |
| `wmake/wmakeFilesAndOptions` | 脚本 | 122 | [打开](files/40/wmakefilesandoptions--40a08bd55975.md) |
| `wmake/wmakeLnInclude` | 脚本 | 199 | [打开](files/bb/wmakelninclude--bbaa54859faa.md) |
| `wmake/wmakeLnIncludeAll` | 脚本 | 224 | [打开](files/5c/wmakelnincludeall--5cdff37d9f67.md) |
| `wmake/wmakePrintBuild` | 脚本 | 246 | [打开](files/ce/wmakeprintbuild--ce9fc0af2b00.md) |
| `wmake/wmakeScheduler` | 脚本 | 253 | [打开](files/f3/wmakescheduler--f36ef36a2233.md) |
| `wmake/wmakeSchedulerUptime` | 脚本 | 286 | [打开](files/80/wmakescheduleruptime--80447e0aeb0c.md) |
| `wmake/wrmdep` | 脚本 | 277 | [打开](files/4a/wrmdep--4a44db8b3eff.md) |
| `wmake/wrmo` | 脚本 | 129 | [打开](files/f3/wrmo--f3556884e26b.md) |
